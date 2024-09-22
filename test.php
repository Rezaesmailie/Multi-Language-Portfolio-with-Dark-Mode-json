<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=utf-8');

$data = [
    'en' => [
        'home' => 'Home',
        'about' => 'About Me',
        'contact' => 'Contact',
        'blog' => 'Blog',
        'product' => 'Product',
        'team' => 'Team',
        'gallery' => 'Gallery',
        'home_title' => 'Reza Esmailg Gol',
        'home_subtitle' => 'Full Stack Web Developer!',
        'home_description' => 'Web Designer & Web Developer',
        'about_description' => 'I am a Full Stack Web Developer with a passion for coding and Python development...',
        'contact_description' => 'Email: rezadigital@gmail.com\nPhone: +989192513015',
        'blog_description' => 'Welcome to my blog! Here I share my thoughts on technology, data science, Python...',
        'product_description' => 'Explore the latest projects and products I\'ve been working on...',
        'team_description' => 'Meet the amazing people I work with...',
        'gallery_description' => 'Here are some images of my recent work and collaborations...'
    ],
    'fa' => [
        'home' => 'خانه',
        'about' => 'درباره من',
        'contact' => 'تماس',
        'blog' => 'وبلاگ',
        'product' => 'محصول',
        'team' => 'تیم',
        'gallery' => 'گالری',
        'home_title' => 'رضا اسماعیل گل',
        'home_subtitle' => 'توسعه‌دهنده فول استک وب',
        'home_description' => 'طراح و توسعه‌دهنده وب',
        'about_description' => 'من یک توسعه دهنده وب هستم که به کدنویسی و توسعه پایتون علاقه دارم...',
        'contact_description' => 'ایمیل: rezadigital@gmail.com\nتلفن: +989192513015',
        'blog_description' => 'به وبلاگ من خوش آمدید! در اینجا من افکار خود را در مورد فناوری، علم داده، پایتون و ... به اشتراک می‌گذارم.',
        'product_description' => 'آخرین پروژه‌ها و محصولاتی که روی آنها کار کرده‌ام را کشف کنید...',
        'team_description' => 'با افراد شگفت انگیزی که با آنها کار می‌کنم آشنا شوید...',
        'gallery_description' => 'در اینجا تصاویری از کارهای اخیر من را مشاهده کنید...'
    ]
];

echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
