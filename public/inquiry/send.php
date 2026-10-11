<?php
// お問い合わせフォームの送信先。PHP が動く本番サーバー（ロリポップ）でだけ働く。
// 届け先を変えるときは、下の TO を書き換える。
declare(strict_types=1);

const TO = 'info@bokuno-tuyatuya.com';
const FROM = 'info@bokuno-tuyatuya.com'; // 迷惑メール扱いを避けるため、差出人はこのドメインのアドレスにする
const LIMIT_PER_HOUR = 5;   // 同じ送信元から
const LIMIT_PER_DAY = 200;  // サイト全体で（大量送信でメールボックスを埋められないように）
const MAX_LINKS = 4;        // 本文中のURLがこれを超えるものは宣伝目的とみなす

header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');
header('Cache-Control: no-store');

function done(int $status, string $message): void
{
    http_response_code($status);
    echo json_encode(['ok' => $status === 200, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    done(405, 'このページは直接開けません。');
}

// ほかのサイトに置かれたフォームからの送信は受け付けない
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && parse_url($origin, PHP_URL_HOST) !== preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? '')) {
    done(403, '送信できませんでした。');
}

$line = static fn (string $key, int $max): string => mb_substr(trim(preg_replace('/[\r\n\t]+/u', ' ', (string) ($_POST[$key] ?? ''))), 0, $max);
$name = $line('name', 80);
$email = $line('email', 200);
$tel = $line('tel', 40);
$subject = $line('subject', 120);
$message = mb_substr(trim(str_replace("\r\n", "\n", (string) ($_POST['message'] ?? ''))), 0, 5000);

// 自動投稿よけ：人には見えない欄が埋まっている、または開いてすぐの送信は、受け付けたふりをして捨てる
if (($_POST['website'] ?? '') !== '' || (int) ($_POST['elapsed'] ?? 0) < 3000) {
    done(200, 'ok');
}

if ($name === '' || $subject === '' || $message === '') {
    done(422, '必須項目をご入力ください。');
}
if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    done(422, 'メールアドレスをご確認ください。');
}
if ($tel !== '' && !preg_match('/^[0-9+\-() ]{6,}$/', $tel)) {
    done(422, '電話番号をご確認ください。');
}

if (preg_match_all('~https?://|www\.~i', $message . ' ' . $subject . ' ' . $name) > MAX_LINKS) {
    done(422, 'URLを多く含むメッセージは送信できません。URLを減らしてお試しください。');
}

// サイト全体の1日あたりの上限
$dayLog = sys_get_temp_dir() . '/bokuno-inquiry-day-' . date('Ymd');
$today = (int) @file_get_contents($dayLog);
if ($today >= LIMIT_PER_DAY) {
    done(429, 'ただいま送信が混み合っています。時間をおいてお試しください。');
}
@file_put_contents($dayLog, (string) ($today + 1), LOCK_EX);

// 同じ送信元からの連続送信を抑える
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$log = sys_get_temp_dir() . '/bokuno-inquiry-' . md5($ip);
$now = time();
$recent = array_filter(array_map('intval', @file($log, FILE_IGNORE_NEW_LINES) ?: []), static fn (int $t): bool => $t > $now - 3600);
if (count($recent) >= LIMIT_PER_HOUR) {
    done(429, '短時間に送信が続いています。時間をおいてお試しください。');
}
$recent[] = $now;
@file_put_contents($log, implode("\n", $recent), LOCK_EX);

date_default_timezone_set('Asia/Tokyo');
mb_language('Japanese');
mb_internal_encoding('UTF-8');

$body = "bokuno 公式サイトのお問い合わせフォームから送信されました。\n\n"
    . "■ 氏名\n{$name}\n\n"
    . "■ メールアドレス\n{$email}\n\n"
    . "■ 電話番号\n" . ($tel !== '' ? $tel : '（未入力）') . "\n\n"
    . "■ 題名\n{$subject}\n\n"
    . "■ メッセージ本文\n{$message}\n\n"
    . "--\n送信日時: " . date('Y-m-d H:i') . "\n";

$headers = 'From: ' . mb_encode_mimeheader('bokuno お問い合わせフォーム') . ' <' . FROM . ">\r\n"
    . "Reply-To: {$email}";

if (!mb_send_mail(TO, "【お問い合わせ】{$subject}", $body, $headers, '-f' . FROM)) {
    done(500, '送信できませんでした。お手数ですが、時間をおいてもう一度お試しください。');
}
done(200, 'ok');
