document.addEventListener("DOMContentLoaded", function () {
    // Fetch language data from the JSON file
    fetch('http://bmq.ir/test.php')
        .then(response => response.json())
        .then(data => {
            const enBtn = document.getElementById('en-btn');
            const faBtn = document.getElementById('fa-btn');
            const modeToggle = document.getElementById('mode-toggle');
            const darkModeIcon = document.getElementById('dark-mode-icon');
            const toggleButton = document.getElementById('toggleButton');
            const flagIcon = toggleButton.querySelector('.flag-icon');

            let currentLang = localStorage.getItem('language') || 'en'; // Default language is English
            let darkMode = localStorage.getItem('darkMode') === 'enabled'; // Load dark mode setting

            // Function to load language
            function loadLanguage(lang) {
                document.getElementById('home').textContent = data[lang].home;
                document.getElementById('about').textContent = data[lang].about;
                document.getElementById('contact').textContent = data[lang].contact;
                document.getElementById('blog').textContent = data[lang].blog;
                document.getElementById('product').textContent = data[lang].product;
                document.getElementById('team').textContent = data[lang].team;
                document.getElementById('gallery').textContent = data[lang].gallery;
                document.getElementById('title').textContent = data[lang].home_title;
                document.getElementById('subtitle').textContent = data[lang].home_subtitle;
                document.getElementById('description').textContent = data[lang].home_description;
                document.getElementById('about-content').textContent = data[lang].about_description;
                document.getElementById('contact-email').textContent = data[lang].contact_description;
                document.getElementById('blog-content').textContent = data[lang].blog_description;
                document.getElementById('product-content').textContent = data[lang].product_description;
                document.getElementById('team-content').textContent = data[lang].team_description;
                document.getElementById('gallery-content').textContent = data[lang].gallery_description;
                document.getElementById('contact-phone').textContent = data[lang].phone;
                document.getElementById('contact-email').textContent = data[lang].email;
            }

            // Load language saved in localStorage
            loadLanguage(currentLang);

            // Set the correct flag icon based on the saved language
            if (currentLang === 'fa') {
                flagIcon.classList.remove('flag-icon-us');
                flagIcon.classList.add('flag-icon-ir');
            } else {
                flagIcon.classList.remove('flag-icon-ir');
                flagIcon.classList.add('flag-icon-us');
            }

            // Toggle language with flag change
            toggleButton.addEventListener('click', function () {
                if (flagIcon.classList.contains('flag-icon-us')) {
                    flagIcon.classList.remove('flag-icon-us');
                    flagIcon.classList.add('flag-icon-ir');
                    loadLanguage('fa');
                    localStorage.setItem('language', 'fa');
                } else {
                    flagIcon.classList.remove('flag-icon-ir');
                    flagIcon.classList.add('flag-icon-us');
                    loadLanguage('en');
                    localStorage.setItem('language', 'en');
                }
            });

            // Dark mode functions
            function enableDarkMode() {
                document.body.classList.add('dark-mode');
                darkModeIcon.classList.remove('fa-sun');
                darkModeIcon.classList.add('fa-moon');
                localStorage.setItem('darkMode', 'enabled');
            }

            function disableDarkMode() {
                document.body.classList.remove('dark-mode');
                darkModeIcon.classList.remove('fa-moon');
                darkModeIcon.classList.add('fa-sun');
                localStorage.setItem('darkMode', null);
            }

            // Load dark mode setting on page load
            if (darkMode) {
                enableDarkMode();
            }

            // Toggle dark mode
            modeToggle.addEventListener('click', function () {
                darkMode = localStorage.getItem('darkMode') === 'enabled';
                if (darkMode) {
                    disableDarkMode();
                } else {
                    enableDarkMode();
                }
            });
        })
        .catch(error => console.error('Error fetching language data:', error));

    // Handling scroll between sections with arrow keys
    const sections = document.querySelectorAll('section');
    let currentSectionIndex = 0;

    function scrollToSection(index) {
        sections[index].scrollIntoView({ behavior: 'smooth' });
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowDown' && currentSectionIndex < sections.length - 1) {
            currentSectionIndex++;
            scrollToSection(currentSectionIndex);
        } else if (event.key === 'ArrowUp' && currentSectionIndex > 0) {
            currentSectionIndex--;
            scrollToSection(currentSectionIndex);
        }
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll('section');

    // بررسی وجود سکشن ذخیره‌شده و اسکرول به آن بخش
    const lastSection = localStorage.getItem('lastSection');
    if (lastSection) {
        document.getElementById(lastSection).scrollIntoView({ behavior: 'smooth' });
    }

    // وقتی کاربر اسکرول می‌کند، آخرین سکشن را در localStorage ذخیره کن
    window.addEventListener('scroll', function () {
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - sectionHeight / 2) {
                currentSection = section.getAttribute('id');
            }
        });
        if (currentSection) {
            localStorage.setItem('lastSection', currentSection);
        }
    });
});

