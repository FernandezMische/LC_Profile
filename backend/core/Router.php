<?php
class Router {
    private $routes = [];
    public function add($method, $path, $callback) {
        $this->routes[] = ['method' => $method, 'path' => $path, 'callback' => $callback];
    }
    public function dispatch($method, $path) {
        error_log("Dispatching: $method $path");
        foreach ($this->routes as $route) {
            if ($route['method'] === $method && $route['path'] === $path) {
                call_user_func($route['callback']);
                return;
            }
        }
        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
    }
}