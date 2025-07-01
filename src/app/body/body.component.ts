import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.css']
})
export class BodyComponent implements AfterViewInit, OnDestroy {
  public isMenuOpen = false;
  public isMotionModalOpen = false;
  public reduceMotionEnabled = false;

  @ViewChild('pinContainer', { static: true }) pinContainer!: ElementRef<HTMLElement>;
  @ViewChild('heroBackground', { static: true }) heroBackground!: ElementRef<HTMLElement>;
  @ViewChild('heroFooter', { static: true }) heroFooter!: ElementRef<HTMLElement>;
  @ViewChild('blackOverlay', { static: true }) blackOverlay!: ElementRef<HTMLDivElement>;
  @ViewChild('heroImageMask', { static: true }) heroImageMask!: ElementRef<HTMLDivElement>;
  @ViewChild('heroWhiteMask', { static: true }) heroWhiteMask!: ElementRef<HTMLDivElement>;
  @ViewChild('finalLogo', { static: true }) finalLogo!: ElementRef<HTMLDivElement>;
  @ViewChild('startupShadow', { static: true }) startupShadow!: ElementRef<HTMLDivElement>;
  @ViewChild('startupContent', { static: true }) startupContent!: ElementRef<HTMLDivElement>;
  @ViewChild('namesContainer', { static: true }) namesContainer!: ElementRef<HTMLDivElement>;

  private ctx!: gsap.Context;

  toggleMenu() { this.isMenuOpen = !this.isMenuOpen; }
  toggleMotionModal() { this.isMotionModalOpen = !this.isMotionModalOpen; }

  ngAfterViewInit() { this.setupAnimations(); }
  ngOnDestroy() { this.ctx.revert(); }

  public toggleReduceMotion() {
    this.reduceMotionEnabled = !this.reduceMotionEnabled;
    this.ctx.revert();
    this.setupAnimations();
  }

  private setupAnimations() {
    this.ctx = gsap.context(() => {
      if (!this.reduceMotionEnabled) {
        this.createScrollAnimation();
      }
    }, this.pinContainer.nativeElement);
  }

  private createScrollAnimation() {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: this.pinContainer.nativeElement,
        pin: true,
        start: 'top top',
        end: '+=20000', // Reduje un poco el final para que no sea tan largo
        scrub: 1.5,   // Un scrub un poco más rápido se siente más responsivo
      }
    });

    const maskedImg = this.heroImageMask.nativeElement.querySelector('img')!;

    // ─── FASE 1: Del fondo al logo centrado (Esto funciona perfecto, no se toca) ────
    tl.to(this.heroFooter.nativeElement, { opacity: 0, duration: 0.5 }, 0)
      .to(this.blackOverlay.nativeElement, { opacity: 1, duration: 1 }, 0)
      .to([this.heroBackground.nativeElement, maskedImg], { scale: 1, duration: 8 }, 0)
      .to([this.heroImageMask.nativeElement, this.heroWhiteMask.nativeElement], { maskSize: '21%', duration: 2 }, 0.5)
      .to(this.heroImageMask.nativeElement, { opacity: 0, duration: 1 },2)
      .to(this.heroWhiteMask.nativeElement, { opacity: 1, duration: 1 }, '<')
      .to(this.heroBackground.nativeElement, { opacity: 0, duration: 1 }, '<')
      .to(this.heroWhiteMask.nativeElement, { opacity: 0, duration: 1 }, '>')
      .to(this.finalLogo.nativeElement, { opacity: 1, duration: 1 }, '<0.5')
      .addLabel('logoCentered', '>');


    // ─── FASE 2: SECUENCIA DE REVELADO PROFESIONAL CON SOMBRA DINÁMICA ───────────────

    // PASO 2.1: El logo sube a su posición final.
    tl.to(this.finalLogo.nativeElement, {
      top: '15%',
      scale: 1.7, // Un poco más pequeño para dar más espacio al contenido
      duration: 1,
      ease: 'power2.inOut'
    }, 'logoCentered')
      .addLabel('logoInPlace', 'logoCentered+=1');

    // PASO 2.2: La SOMBRA aparece PRIMERO, de forma sutil.
    tl.to(this.startupShadow.nativeElement, {
      opacity: 1,
      duration: 2,
      ease: 'power1.in'
    }, 'logoInPlace-=3.5'); // Inicia un poco antes de que el logo termine de llegar

    // PASO 2.3: El H1 "Startup" aparece DESPUÉS de la sombra.
    tl.to(this.startupContent.nativeElement, {
      opacity: 1,
      duration: 1,
      ease: 'power1.out'
    }, 'logoInPlace+=0.5') // Inicia cuando la sombra ya es visible
      .addLabel('h1Visible', '>');

    // PASO 2.4: El H1 se encoge a su tamaño final.
    tl.to(this.startupContent.nativeElement, {
      scale: 1,
      top: 0,
      duration: 2,
      ease: 'power2.inOut'
    }, 'h1Visible')
      .addLabel('shrinkH1', '<'); // Etiqueta para el INICIO del encogimiento

    // =================================================================================
    // === ¡AQUÍ ESTÁ LA MAGIA! ANIMACIÓN DEL GRADIENTE DE LA SOMBRA ===================
    // =================================================================================
    // Mientras el H1 se encoge, la sombra se "abre" desde el centro.
    // Animamos la variable CSS '--gradient-center-size' de 20% a 90%.
    tl.to(this.startupShadow.nativeElement, {
      duration: 3, // Un poco más largo que el encogimiento del H1 para un efecto suave
      ease: 'power3.inOut'
    }, 'shrinkH1'); // Empieza EXACTAMENTE al mismo tiempo que el H1 se encoge

    // PASO 2.5: Aparecen los nombres mientras la sombra se está abriendo.
    tl.to(this.namesContainer.nativeElement, {
      opacity: 1,
      y: -100,
      duration: 2,
      ease: 'power2.out'
    }, 'shrinkH1+=1.5'); // Empieza a la mitad de la animación de la sombra/H1

    // PASO 2.6: La capa de la sombra (que ahora es casi transparente) se desvanece por completo.
    tl.to(this.startupShadow.nativeElement, {
 
      opacity: 0,
      duration: 3,
      ease: 'power2.out'
    }, '-=1'); // Se superpone un poco con el final de las otras animaciones para fluidez
  }
}