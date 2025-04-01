import AOS from 'aos';
export function initAOS(): void {
  AOS.init({
    duration: 1000,
    once: true,
    easing: 'ease-in-out'
  });
}
