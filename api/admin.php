<?php
// api/admin.php — Admin-only CRUD + auth endpoints
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

match($action) {
    'login'          => adminLogin(),
    'logout'         => adminLogout(),
    'dashboard'      => adminDashboard(),
    'orders'         => adminOrders(),
    'order_update'   => updateOrder(),
    'order_delete'   => deleteOrder(),
    'send_invoice'   => sendInvoiceEmail(),
    default          => jsonResponse(['error' => 'Invalid action'], 404),
};

function adminLogin(): void {
    $body = json_decode(file_get_contents('php://input'), true);
    if (($body['username'] ?? '') === ADMIN_USER && ($body['password'] ?? '') === ADMIN_PASS) {
        $token = bin2hex(random_bytes(32));
        $_SESSION['admin_token'] = $token;
        jsonResponse(['success' => true, 'token' => $token]);
    }
    jsonResponse(['error' => 'Invalid credentials'], 401);
}

function adminLogout(): void {
    session_destroy();
    jsonResponse(['success' => true]);
}

function adminDashboard(): void {
    requireAdmin();
    $db = getDB();

    $total   = $db->query("SELECT COUNT(*) FROM orders_collection")->fetchColumn();
    $revenue = $db->query("SELECT COALESCE(SUM(grand_total),0) FROM orders_collection WHERE status != 'cancelled'")->fetchColumn();
    $pending = $db->query("SELECT COUNT(*) FROM orders_collection WHERE status='pending'")->fetchColumn();
    $today   = $db->query("SELECT COUNT(*) FROM orders_collection WHERE DATE(created_at)=CURDATE()")->fetchColumn();

    $recent  = $db->query("SELECT order_id,customer_name,grand_total,status,created_at FROM orders_collection ORDER BY created_at DESC LIMIT 10")->fetchAll();

    $byStatus = $db->query("SELECT status, COUNT(*) as count FROM orders_collection GROUP BY status")->fetchAll();

    jsonResponse([
        'total_orders'  => (int)$total,
        'revenue'       => (float)$revenue,
        'pending_orders'=> (int)$pending,
        'today_orders'  => (int)$today,
        'recent_orders' => $recent,
        'by_status'     => $byStatus,
    ]);
}

function adminOrders(): void {
    requireAdmin();
    $db     = getDB();
    $status = $_GET['status'] ?? '';
    $search = $_GET['search'] ?? '';
    $page   = max(1, (int)($_GET['page'] ?? 1));
    $limit  = 20;
    $offset = ($page - 1) * $limit;

    $where  = [];
    $params = [];
    if ($status) { $where[] = 'status = ?'; $params[] = $status; }
    if ($search) { $where[] = '(customer_name LIKE ? OR order_id LIKE ? OR customer_phone LIKE ?)'; $params = array_merge($params, ["%$search%","%$search%","%$search%"]); }

    $whereSQL = $where ? 'WHERE ' . implode(' AND ', $where) : '';
    $total    = $db->prepare("SELECT COUNT(*) FROM orders_collection $whereSQL");
    $total->execute($params);
    $totalCount = $total->fetchColumn();

    $stmt = $db->prepare("SELECT * FROM orders_collection $whereSQL ORDER BY created_at DESC LIMIT $limit OFFSET $offset");
    $stmt->execute($params);
    $orders = $stmt->fetchAll();
    foreach ($orders as &$o) $o['items'] = json_decode($o['items'], true);

    jsonResponse(['orders' => $orders, 'total' => (int)$totalCount, 'page' => $page, 'pages' => ceil($totalCount/$limit)]);
}

function updateOrder(): void {
    requireAdmin();
    if ($_SERVER['REQUEST_METHOD'] !== 'PUT') jsonResponse(['error' => 'PUT only'], 405);
    $id   = $_GET['order_id'] ?? '';
    $body = json_decode(file_get_contents('php://input'), true);
    $db   = getDB();

    $fields = [];
    $params = [];
    $allowed = ['status','payment_status','payment_method','notes','delivery_charge'];
    foreach ($allowed as $f) {
        if (isset($body[$f])) { $fields[] = "$f=?"; $params[] = $body[$f]; }
    }
    if (!$fields) jsonResponse(['error' => 'Nothing to update'], 422);
    $params[] = $id;
    $db->prepare("UPDATE orders_collection SET ".implode(',',$fields)." WHERE order_id=?")->execute($params);
    jsonResponse(['success' => true]);
}

function deleteOrder(): void {
    requireAdmin();
    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') jsonResponse(['error' => 'DELETE only'], 405);
    $id = $_GET['order_id'] ?? '';
    getDB()->prepare("DELETE FROM orders_collection WHERE order_id=?")->execute([$id]);
    jsonResponse(['success' => true]);
}

function sendInvoiceEmail(): void {
    requireAdmin();
    $id   = $_GET['order_id'] ?? '';
    $db   = getDB();
    $stmt = $db->prepare("SELECT * FROM orders_collection WHERE order_id=?");
    $stmt->execute([$id]);
    $order = $stmt->fetch();
    if (!$order) jsonResponse(['error' => 'Order not found'], 404);
    $order['items'] = json_decode($order['items'], true);

    $itemsHtml = '';
    foreach ($order['items'] as $item) {
        $itemsHtml .= "<tr>
          <td style='padding:6px 10px;border-bottom:1px solid #eee'>{$item['name']}</td>
          <td style='padding:6px 10px;border-bottom:1px solid #eee;text-align:center'>{$item['quantity']}</td>
          <td style='padding:6px 10px;border-bottom:1px solid #eee;text-align:right'>₹{$item['price']}</td>
          <td style='padding:6px 10px;border-bottom:1px solid #eee;text-align:right'>₹".($item['price']*$item['quantity'])."</td>
        </tr>";
    }

    $to      = $order['customer_email'];
    $subject = "Invoice {$order['invoice_number']} — Vakif Jewellery";
    $body    = "
    <html><body style='font-family:Georgia,serif;color:#333;max-width:600px;margin:0 auto'>
      <div style='background:#0a0a0a;padding:20px;text-align:center'>
        <h1 style='color:#D4AF37;font-size:28px;margin:0'>VAKIF JEWELLERY</h1>
        <p style='color:#D4AF37;margin:4px 0'>TAX INVOICE</p>
        <p style='color:#888;margin:0;font-size:12px'>{$order['invoice_number']}</p>
      </div>
      <div style='padding:30px'>
        <table style='width:100%'><tr>
          <td><strong>Bill To:</strong><br>{$order['customer_name']}<br>{$order['customer_phone']}<br>{$order['delivery_address']}</td>
          <td style='text-align:right'><strong>Invoice:</strong> {$order['invoice_number']}<br><strong>Order:</strong> {$order['order_id']}<br><strong>Date:</strong> {$order['created_at']}</td>
        </tr></table>
        <hr style='border-color:#D4AF37'>
        <table style='width:100%;border-collapse:collapse'>
          <tr style='background:#D4AF37;color:#000'><th style='padding:8px'>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
          $itemsHtml
          <tr><td colspan='3' style='text-align:right;padding:10px'><strong>Grand Total</strong></td><td style='padding:10px;text-align:right'><strong>₹{$order['grand_total']}</strong></td></tr>
        </table>
        <p style='text-align:center;color:#888;font-size:12px;margin-top:30px'>Thank you for shopping at Vakif Jewellery!<br>Supur, Idar, Gujarat | +91 98989 37895 | vakif@gmail.com</p>
      </div>
    </html></body>";

    $headers  = "MIME-Version: 1.0\r\nContent-type: text/html; charset=utf-8\r\nFrom: Vakif Jewellery <".SMTP_FROM.">\r\n";
    $sent     = @mail($to, $subject, $body, $headers);
    jsonResponse(['success' => $sent, 'sent_to' => $to]);
}
