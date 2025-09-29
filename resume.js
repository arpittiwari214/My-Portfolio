import * as THREE from 'three';

document.addEventListener('DOMContentLoaded', () => {
    // --- PRELOADER ---
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });

    gsap.registerPlugin(ScrollTrigger);

    // --- THEME TOGGLE ---
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
    });

    // --- CUSTOM CURSOR ---
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorCircle = document.querySelector('.cursor-circle');
    const magneticElements = document.querySelectorAll('.magnetic');

    if (window.matchMedia("(pointer: fine)").matches) {
        document.body.style.cursor = 'none';
        cursorDot.style.opacity = 1;
        cursorCircle.style.opacity = 1;

        let mouseX = 0,
            mouseY = 0,
            dotX = 0,
            dotY = 0,
            circleX = 0,
            circleY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateCursor() {
            dotX += (mouseX - dotX) * 0.7;
            dotY += (mouseY - dotY) * 0.7;
            circleX += (mouseX - circleX) * 0.1;
            circleY += (mouseY - circleY) * 0.1;

            cursorDot.style.transform = `translate(${dotX}px, ${dotY}px)`;
            cursorCircle.style.transform = `translate(${circleX - 20}px, ${circleY - 20}px)`;
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        magneticElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursorCircle.classList.add('hover'));
            el.addEventListener('mouseleave', () => {
                cursorCircle.classList.remove('hover');
                gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
            });

            let rect = el.getBoundingClientRect();
            window.addEventListener('resize', () => { rect = el.getBoundingClientRect(); });

            el.addEventListener('mousemove', (e) => {
                let x = e.clientX - rect.left - rect.width / 2;
                let y = e.clientY - rect.top - rect.height / 2;
                gsap.to(el, { x: x * 0.1, y: y * 0.1, duration: 0.5, ease: "power3.out" });
            });
        });
    }

    // --- MOBILE NAVIGATION ---
    const navToggle = document.querySelector('.nav-toggle');
    navToggle.addEventListener('click', () => {
        document.body.classList.toggle('nav-open');
    });

    // --- GSAP ANIMATIONS ---
    gsap.from(".hero-title .line, .subtitle .line", {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.2
    });
    gsap.from(".hero-ctas, .hero-image", {
        opacity: 0,
        y: 20,
        duration: 1,
        delay: 0.6,
        stagger: 0.2
    });

    gsap.utils.toArray('.reveal').forEach(el => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 80%",
            },
            opacity: 0,
            y: 50,
            duration: 1.2,
            ease: "power3.out",
        });
    });
    
    // --- ICON HOVER ANIMATION (No changes needed, handled by CSS) ---

    // --- MODAL LOGIC ---
    const projectCards = document.querySelectorAll('.project-card');
    const modalOverlay = document.querySelector('.modal-overlay');
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const modal = document.getElementById(card.dataset.modalTarget);
            modal.classList.add('active');
            modalOverlay.classList.add('active');
        });
    });

    function closeModal() {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            modalOverlay.classList.remove('active');
        }
    }
    document.querySelectorAll('.modal-close').forEach(btn => btn.addEventListener('click', closeModal));
    modalOverlay.addEventListener('click', closeModal);

    // --- BACK TO TOP BUTTON ---
    const backToTop = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 300);
    });

    // --- CONTACT FORM ---
    const form = document.getElementById('contact-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(form);
        const object = {};
        formData.forEach((value, key) => {
            object[key] = value
        });
        const json = JSON.stringify(object);

        fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            })
            .then(async (response) => {
                let jsonResponse = await response.json();
                if (response.status == 200) {
                    alert(jsonResponse.message || 'Success! Your message has been sent.');
                    form.reset();
                } else {
                    alert(jsonResponse.message || 'Oops! Something went wrong.');
                }
            })
            .catch(error => {
                console.log(error);
                alert('Oops! Something went wrong.');
            });
    });

    // --- THREE.JS 3D BACKGROUND ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(2.5, 1);
    const material = new THREE.MeshStandardMaterial({
        color: 0x8A44F2,
        wireframe: true,
    });
    const shape = new THREE.Mesh(geometry, material);
    scene.add(shape);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    camera.position.z = 5;

    function animate3D() {
        requestAnimationFrame(animate3D);
        shape.rotation.x += 0.001;
        shape.rotation.y += 0.001;
        renderer.render(scene, camera);
    }
    animate3D();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});