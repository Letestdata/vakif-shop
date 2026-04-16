<?php
// api/config.php — DB connection + helpers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'vakifshop');

define('ADMIN_USER', 'admin');
define('ADMIN_PASS', 'vakif@admin123');
define('SHOP_EMAIL', 'vakif@gmail.com');
define('SMTP_FROM',  'noreply@vakifshop.com');

function getDB(): PDO {
    static $pdo = null;
    if (!$pdo) {
        $dsn = 'mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }
    return $pdo;
}

function jsonResponse(mixed $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function generateOrderId(): string {
    return 'VAK' . strtoupper(substr(uniqid(), -6)) . rand(10,99);
}

function generateInvoiceNumber(string $orderId): string {
    return 'INV-' . date('Ymd') . '-' . substr($orderId, 3);
}

// Simple admin auth via Bearer token stored in session
session_start();
function requireAdmin(): void {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token = str_replace('Bearer ', '', $auth);
    if ($token !== ($_SESSION['admin_token'] ?? '')) {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }
}
