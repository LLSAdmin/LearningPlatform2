<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$baseDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data';
$storeFile = $baseDir . DIRECTORY_SEPARATOR . 'teachers.json';
$profilesDir = $baseDir . DIRECTORY_SEPARATOR . 'teachers';
if (!is_dir($baseDir)) @mkdir($baseDir, 0775, true);
if (!is_dir($profilesDir)) @mkdir($profilesDir, 0775, true);
if (!file_exists($storeFile)) file_put_contents($storeFile, json_encode([]));

function load_store($file) { $raw = @file_get_contents($file); $data = json_decode($raw ?: '[]', true); return is_array($data) ? $data : []; }
function save_store($file, $arr) { file_put_contents($file, json_encode(array_values($arr), JSON_PRETTY_PRINT)); }
function json_input() { $raw = file_get_contents('php://input'); $data = json_decode($raw ?: '[]', true); return is_array($data) ? $data : []; }

$method = $_SERVER['REQUEST_METHOD'];
$list = load_store($storeFile);

if ($method === 'GET') {
    if (isset($_GET['id'])) {
        foreach ($list as $item) { if (strval($item['id']) === strval($_GET['id'])) { echo json_encode($item); exit; } }
        http_response_code(404); echo json_encode(['error'=>'Teacher not found']); exit;
    }
    if (isset($_GET['username'])) {
        foreach ($list as $item) { if (strval($item['username']) === strval($_GET['username'])) { echo json_encode($item); exit; } }
        http_response_code(404); echo json_encode(['error'=>'Teacher not found']); exit;
    }
    echo json_encode($list); exit;
}

if ($method === 'POST') {
    $data = json_input();
    $ids = array_map(function($x){ return intval($x['id']); }, $list);
    $next = empty($ids) ? 1 : (max($ids)+1);
    $rec = [
        'id' => $next,
        'username' => $data['username'] ?? ('teacher'.$next),
        'name' => $data['name'] ?? 'Teacher',
        'email' => $data['email'] ?? '',
        'timezone' => $data['timezone'] ?? 'UTC'
    ];
    $list[] = $rec; save_store($storeFile, $list);
    // write profile file
    $pdir = $profilesDir . DIRECTORY_SEPARATOR . $rec['id'];
    if (!is_dir($pdir)) @mkdir($pdir, 0775, true);
    file_put_contents($pdir . DIRECTORY_SEPARATOR . 'profile.json', json_encode($rec, JSON_PRETTY_PRINT));
    echo json_encode($rec); exit;
}

if ($method === 'PUT') {
    $data = json_input();
    if (!isset($data['id'])) { http_response_code(400); echo json_encode(['error'=>'Missing id']); exit; }
    $updated = null;
    foreach ($list as &$item) {
        if (strval($item['id']) === strval($data['id'])) {
            foreach (['username','name','email','timezone'] as $k) { if (array_key_exists($k,$data)) $item[$k]=$data[$k]; }
            $updated = $item; break;
        }
    }
    if (!$updated) { http_response_code(404); echo json_encode(['error'=>'Teacher not found']); exit; }
    save_store($storeFile, $list);
    $pdir = $profilesDir . DIRECTORY_SEPARATOR . $updated['id'];
    if (!is_dir($pdir)) @mkdir($pdir, 0775, true);
    file_put_contents($pdir . DIRECTORY_SEPARATOR . 'profile.json', json_encode($updated, JSON_PRETTY_PRINT));
    echo json_encode($updated); exit;
}

if ($method === 'DELETE') {
    if (!isset($_GET['id'])) { http_response_code(400); echo json_encode(['error'=>'Missing id']); exit; }
    $id = strval($_GET['id']);
    $before = count($list);
    $list = array_values(array_filter($list, function($x) use ($id){ return strval($x['id']) !== $id; }));
    if (count($list) === $before) { http_response_code(404); echo json_encode(['error'=>'Teacher not found']); exit; }
    save_store($storeFile, $list);
    echo json_encode(['success'=>true]); exit;
}

http_response_code(405); echo json_encode(['error'=>'Method not allowed']);



