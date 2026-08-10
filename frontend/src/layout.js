function adjustLayout() {
    const sidebar = document.getElementById("sidebar");
    const main = document.getElementById("main");

    if (sidebar && main) {
        const sidebarWidth = sidebar.offsetWidth;
        main.style.marginLeft = sidebarWidth + "px";
        main.style.width = `calc(100% - ${sidebarWidth}px)`;
    }
}

// Run on load
window.addEventListener("load", adjustLayout);

// Run on resize (responsive)
window.addEventListener("resize", adjustLayout);

// Sidebar toggle for mobile
const toggleBtn = document.getElementById("toggleBtn");
const sidebar = document.getElementById("sidebar");

if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("active");
        adjustLayout(); // re‑calculate layout when sidebar is toggled
    });
}
