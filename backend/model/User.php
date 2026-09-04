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
        $stmt->execute(['email' => $email, 'hash' => $hash]);
        return $this->pdo->lastInsertId();
    }

    //get all users
    public function getAll($search, $limit, $offset) {
        $where = 'WHERE 1 = 1';
        $params = [];
        if ($search !== '') {
            $where .= ' AND email LIKE :search';
            $params['search'] = '%' . $search . '%';
        }
        $count = $this->pdo->prepare("SELECT COUNT(*) FROM users $where");
        $count->execute($params);
        $stmt = $this->pdo->prepare("SELECT id, email, created_at FROM users $where ORDER BY created_at DESC LIMIT :limit OFFSET :offset");
        foreach ($params as $key => $value) { $stmt->bindValue(':' . $key, $value, PDO::PARAM_STR); }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return ['admins' => $stmt->fetchAll(), 'total' => (int) $count->fetchColumn()];
    }

    //update a user's email and/or password by id
    public function updateUser($id, $email = null, $plainPassword = null) {
        $fields = [];
        $params = ['id' => $id];

        if ($email !== null) {
            $fields[] = "email = :email";
            $params['email'] = $email;
        }
        if ($plainPassword !== null) {
            $fields[] = "password_hash = :hash";
            $params['hash'] = password_hash($plainPassword, PASSWORD_DEFAULT);
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($params);
    }

    //delete a user by id
    public function deleteUser($id) {
        $stmt = $this->pdo->prepare("DELETE FROM users WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

}
