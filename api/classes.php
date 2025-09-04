<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$baseDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data';
$storeFile = $baseDir . DIRECTORY_SEPARATOR . 'classes.json';
$classesDir = $baseDir . DIRECTORY_SEPARATOR . 'classes';
if (!is_dir($baseDir)) @mkdir($baseDir, 0775, true);
if (!is_dir($classesDir)) @mkdir($classesDir, 0775, true);
if (!file_exists($storeFile)) file_put_contents($storeFile, json_encode([]));

function load_store($file) {
    $raw = @file_get_contents($file);
    $data = json_decode($raw ?: '[]', true);
    return is_array($data) ? $data : [];
}
function save_store($file, $arr) {
    file_put_contents($file, json_encode(array_values($arr), JSON_PRETTY_PRINT));
}
function json_input() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '[]', true);
    return is_array($data) ? $data : [];
}

$method = $_SERVER['REQUEST_METHOD'];
$list = load_store($storeFile);

if ($method === 'GET') {
    if (isset($_GET['id'])) {
        foreach ($list as $item) {
            if (strval($item['id']) === strval($_GET['id'])) { echo json_encode($item); exit; }
        }
        http_response_code(404); echo json_encode(['error'=>'Class not found']); exit;
    }
    echo json_encode($list); exit;
}

if ($method === 'POST') {
    $data = json_input();
    $ids = array_map(function($x){ return intval($x['id']); }, $list);
    $next = empty($ids) ? 1 : (max($ids)+1);
    $rec = [
        'id' => $next,
        'name' => $data['name'] ?? 'Untitled Class',
        'student_name' => $data['student_name'] ?? 'Student',
        'teacher_name' => $data['teacher_name'] ?? 'Teacher',
        'scheduled_date' => $data['scheduled_date'] ?? date('Y-m-d'),
        'scheduled_time' => $data['scheduled_time'] ?? '09:00',
        'duration' => isset($data['duration']) ? intval($data['duration']) : 60,
        'status' => $data['status'] ?? 'scheduled'
    ];
    $list[] = $rec;
    save_store($storeFile, $list);
    // write class file
    $cdir = $classesDir . DIRECTORY_SEPARATOR . $rec['id'];
    if (!is_dir($cdir)) @mkdir($cdir, 0775, true);
    file_put_contents($cdir . DIRECTORY_SEPARATOR . 'class.json', json_encode($rec, JSON_PRETTY_PRINT));
    echo json_encode($rec); exit;
}

if ($method === 'PUT') {
    $data = json_input();
    if (!isset($data['id'])) { http_response_code(400); echo json_encode(['error'=>'Missing id']); exit; }
    $updated = null;
    foreach ($list as &$item) {
        if (strval($item['id']) === strval($data['id'])) {
            foreach (['name','student_name','teacher_name','scheduled_date','scheduled_time','duration','status','feedback'] as $k) {
                if (array_key_exists($k, $data)) { $item[$k] = $data[$k]; }
            }
            $updated = $item; break;
        }
    }
    if (!$updated) { http_response_code(404); echo json_encode(['error'=>'Class not found']); exit; }
    save_store($storeFile, $list);
    $cdir = $classesDir . DIRECTORY_SEPARATOR . $updated['id'];
    if (!is_dir($cdir)) @mkdir($cdir, 0775, true);
    file_put_contents($cdir . DIRECTORY_SEPARATOR . 'class.json', json_encode($updated, JSON_PRETTY_PRINT));
    echo json_encode($updated); exit;
}

if ($method === 'DELETE') {
    if (!isset($_GET['id'])) { http_response_code(400); echo json_encode(['error'=>'Missing id']); exit; }
    $id = strval($_GET['id']);
    $before = count($list);
    $list = array_values(array_filter($list, function($x) use ($id){ return strval($x['id']) !== $id; }));
    if (count($list) === $before) { http_response_code(404); echo json_encode(['error'=>'Class not found']); exit; }
    save_store($storeFile, $list);
    // leave class folder in place as archive
    echo json_encode(['success'=>true]); exit;
}

http_response_code(405); echo json_encode(['error'=>'Method not allowed']);



