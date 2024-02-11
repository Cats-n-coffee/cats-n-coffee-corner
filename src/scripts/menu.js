document.querySelector('.mobile-menu-open').addEventListener('click', () => {
    document.querySelector('.navbar-wrapper').classList.toggle('expanded');
    document.body.classList.add('mobile-menu-opened');
})

document.querySelector('.mobile-menu-close').addEventListener('click', () => {
    document.querySelector('.navbar-wrapper').classList.toggle('expanded');
    document.body.classList.remove('mobile-menu-opened');
})