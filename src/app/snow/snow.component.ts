import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-snow',
  template: `<canvas #snowCanvas class="snow-canvas"></canvas>`,
  styleUrls: ['./snow.component.scss']
})
export class SnowComponent implements AfterViewInit {
  @ViewChild('snowCanvas') snowCanvas!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private snowflakes: any[] = [];

  ngAfterViewInit() {
    const canvas = this.snowCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas(canvas);
    window.addEventListener('resize', () => this.resizeCanvas(canvas));

    this.createSnowflakes(100);
    this.animateSnowflakes();
  }

  resizeCanvas(canvas: HTMLCanvasElement) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  createSnowflakes(count: number) {
    for (let i = 0; i < count; i++) {
      this.snowflakes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 4 + 1,
        speed: Math.random() * 3 + 1,
        drift: Math.random() * 2 - 1
      });
    }
  }

  animateSnowflakes() {
    const canvas = this.snowCanvas.nativeElement;
    const width = canvas.width;
    const height = canvas.height;

    const loop = () => {
      this.ctx.clearRect(0, 0, width, height);
      for (const flake of this.snowflakes) {
        flake.y += flake.speed;
        flake.x += flake.drift;

        if (flake.y > height) {
          flake.y = -flake.radius;
          flake.x = Math.random() * width;
        }

        this.ctx.beginPath();
        this.ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();
      }

      requestAnimationFrame(loop);
    };

    loop();
  }
}
