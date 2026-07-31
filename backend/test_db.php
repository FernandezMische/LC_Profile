<?php
require_once __DIR__ . '/config/database.php';
try {
    $pdo = getDBConnection();
    echo "✅ Connection successful!";
} catch (Exception $e) {
    echo "❌ " . $e->getMessage();
}