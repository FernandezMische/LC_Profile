<?php
require_once __DIR__ . '/../config/database.php';

class User {
    private $pdo;
    public function __construct() {
        $this->pdo = getDBConnection();
    }
    public function findByEmail($email) {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->execute(['email' => $email]);
        return $stmt->fetch();
    }
    public function verifyPassword($plain, $hash) {
        return password_verify($plain, $hash);
    }
    //create a new user with email and password
    public function createUser($email, $plainPassword) {
        $hash = password_hash($plainPassword, PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare("INSERT INTO users (email, password_hash) VALUES (:email, :hash)");
        return $stmt->execute(['email' => $email, 'hash' => $hash]);
    }
}