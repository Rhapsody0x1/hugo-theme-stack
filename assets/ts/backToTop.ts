/**
 * Back-to-top button: fades in after scrolling past a threshold,
 * smooth scrolls back to top on click.
 */
export function setupBackToTop(): void {
    const button = document.getElementById('back-to-top') as HTMLButtonElement | null;
    if (!button) return;

    const SHOW_THRESHOLD_PX = 300;

    let rafPending = false;

    const updateVisibility = () => {
        const scrolled = (document.documentElement.scrollTop || document.body.scrollTop) > SHOW_THRESHOLD_PX;
        button.classList.toggle('visible', scrolled);
    };

    // requestAnimationFrame 节流（与 tocToggle 风格一致）：每帧最多处理一次
    const onScroll = () => {
        if (rafPending) return;
        rafPending = true;
        window.requestAnimationFrame(() => {
            rafPending = false;
            updateVisibility();
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateVisibility();

    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
