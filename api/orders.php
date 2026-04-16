<?php
// api/orders.php — Customer-facing order endpoints
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$path   = $_GET['action'] ?? '';

match($path) {
    'create'  => createOrder(),
    'list'    => listOrders(),
    'get'     => getOrder(),
    'track'   => trackOrder(),
    default   => jsonResponse(['error' => 'Invalid action'], 404),
};

// ── POST /api/orders.php?action=create ────────────────────
function createOrder(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['error' => 'POST only'], 405);

    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) jsonResponse(['error' => 'Invalid JSON'], 400);

    $required = ['customer_name','customer_email','customer_phone','delivery_address','items','grand_total'];
    foreach ($required as $field) {
        if (empty($body[$field])) jsonResponse(['error' => "Missing: $field"], 422);
    }

    $db       = getDB();
    $orderId  = generateOrderId();
    $invoiceN = generateInvoiceNumber($orderId);
    $items    = is_string($body['items']) ? $body['items'] : json_encode($body['items']);

    $stmt = $db->prepare("
        INSERT INTO orders_collection
          (order_id, customer_name, customer_email, customer_phone,
           delivery_address, special_instructions, items,
           subtotal, delivery_charge, grand_total,
           invoice_number, invoice_generated, status, payment_method)
        VALUES
          (:order_id, :cname, :cemail, :cphone,
           :addr, :notes, :items,
           :subtotal, :delivery, :grand_total,
           :invoice_n, 1, 'pending', 'COD')
    ");

    $stmt->execute([
        ':order_id'   => $orderId,
        ':cname'      => $body['customer_name'],
        ':cemail'     => $body['customer_email'],
        ':cphone'     => $body['customer_phone'],
        ':addr'       => $body['delivery_address'],
        ':notes'      => $body['special_instructions'] ?? '',
        ':items'      => $items,
        ':subtotal'   => (float)($body['subtotal'] ?? $body['grand_total']),
        ':delivery'   => (float)($body['delivery_charge'] ?? 0),
        ':grand_total'=> (float)$body['grand_total'],
        ':invoice_n'  => $invoiceN,
    ]);

    sendOrderEmail($body, $orderId, $invoiceN);

    jsonResponse([
        'success'        => true,
        'order_id'       => $orderId,
        'invoice_number' => $invoiceN,
        'message'        => 'Order placed successfully!',
    ], 201);
}

// ── GET /api/orders.php?action=list&email=... ─────────────
function listOrders(): void {
    $email = $_GET['email'] ?? '';
    $db    = getDB();
    if ($email) {
        $stmt = $db->prepare("SELECT * FROM orders_collection WHERE customer_email=? ORDER BY created_at DESC");
        $stmt->execute([$email]);
    } else {
        $stmt = $db->query("SELECT * FROM orders_collection ORDER BY created_at DESC LIMIT 50");
    }
    $orders = $stmt->fetchAll();
    foreach ($orders as &$o) $o['items'] = json_decode($o['items'], true);
    jsonResponse(['orders' => $orders]);
}

// ── GET /api/orders.php?action=get&order_id=... ───────────
function getOrder(): void {
    $id   = $_GET['order_id'] ?? '';
    $db   = getDB();
    $stmt = $db->prepare("SELECT * FROM orders_collection WHERE order_id=? LIMIT 1");
    $stmt->execute([$id]);
    $order = $stmt->fetch();
    if (!$order) jsonResponse(['error' => 'Order not found'], 404);
    $order['items'] = json_decode($order['items'], true);
    jsonResponse(['order' => $order]);
}

// ── GET /api/orders.php?action=track&order_id=...&phone=... ─
function trackOrder(): void {
    $id    = $_GET['order_id'] ?? '';
    $phone = $_GET['phone']    ?? '';
    $db    = getDB();
    $stmt  = $db->prepare("SELECT order_id,customer_name,status,grand_total,invoice_number,created_at FROM orders_collection WHERE order_id=? AND customer_phone=?");
    $stmt->execute([$id, $phone]);
    $order = $stmt->fetch();
    if (!$order) jsonResponse(['error' => 'Order not found or phone mismatch'], 404);
    jsonResponse(['order' => $order]);
}

// ── Email helper ──────────────────────────────────────────
function sendOrderEmail(array $data, string $orderId, string $invoiceN): void {
    $to      = $data['customer_email'];
    $subject = "Order Confirmed — $orderId | Vakif Jewellery";

    $itemsHtml = '';
    $items = is_string($data['items']) ? json_decode($data['items'], true) : $data['items'];
    foreach ((array)$items as $item) {
        $itemsHtml .= "<tr>
          <td style='padding:6px 10px;border-bottom:1px solid #eee'>{$item['name']}</td>
          <td style='padding:6px 10px;border-bottom:1px solid #eee;text-align:center'>{$item['quantity']}</td>
          <td style='padding:6px 10px;border-bottom:1px solid #eee;text-align:right'>₹{$item['price']}</td>
          <td style='padding:6px 10px;border-bottom:1px solid #eee;text-align:right'>₹".($item['price']*$item['quantity'])."</td>
        </tr>";
    }

    $body = "
    <html><body style='font-family:Georgia,serif;color:#333;max-width:600px;margin:0 auto'>
      <div style='background:#0a0a0a;padding:20px;text-align:center'>
        <h1 style='color:#D4AF37;font-size:28px;margin:0'>VAKIF</h1>
        <p style='color:#aaa;margin:5px 0 0'>Luxury Artificial Jewellery</p>
      </div>
      <div style='padding:30px'>
        <h2>Order Confirmed! 🎉</h2>
        <p>Dear <strong>{$data['customer_name']}</strong>,<br>Thank you for shopping with Vakif Jewellery. Your order has been received.</p>
        <table style='width:100%;border-collapse:collapse'>
          <tr style='background:#D4AF37;color:#000'>
            <th style='padding:8px 10px;text-align:left'>Product</th>
            <th style='padding:8px 10px'>Qty</th>
            <th style='padding:8px 10px;text-align:right'>Price</th>
            <th style='padding:8px 10px;text-align:right'>Total</th>
          </tr>
          $itemsHtml
        </table>
        <p style='text-align:right;font-size:18px'><strong>Grand Total: ₹{$data['grand_total']}</strong></p>
        <hr>
        <p><strong>Order ID:</strong> $orderId<br>
           <strong>Invoice:</strong> $invoiceN<br>
           <strong>Delivery to:</strong> {$data['delivery_address']}<br>
           <strong>Phone:</strong> {$data['customer_phone']}</p>
        <p style='background:#f9f3e3;padding:15px;border-left:4px solid #D4AF37'>
          Our team will contact you on WhatsApp to confirm availability & delivery. 
          <a href='https://wa.me/919898937895'>Chat with us</a>
        </p>
      </div>
      <div style='background:#0a0a0a;padding:15px;text-align:center;color:#888;font-size:12px'>
        Vakif Jewellery, Supur, Idar, Gujarat | +91 98989 37895
      </div>
    </html></body>";

    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=utf-8\r\n";
    $headers .= "From: Vakif Jewellery <".SMTP_FROM.">\r\n";

    @mail($to, $subject, $body, $headers);
    // Also notify shop owner
    @mail(SHOP_EMAIL, "New Order $orderId — ₹{$data['grand_total']}", $body, $headers);
}
