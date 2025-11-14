import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { MainlayoutService } from 'src/app/services/main-layout.service';

@Component({
  selector: 'app-nav-details',
  templateUrl: './nav-details.component.html',
  styleUrls: ['./nav-details.component.css'],
})
export class NavDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  completedTabs: any = {};

  @ViewChild('tabsContainer', { static: false })
  tabsContainer!: ElementRef<HTMLElement>;

  private resizeObserver?: ResizeObserver;

  constructor(private mainLayoutService: MainlayoutService) {}

  ngOnInit(): void {
    this.mainLayoutService.completedTabs$.subscribe((tabs) => {
      this.completedTabs = tabs;
    });
  }

  ngAfterViewInit(): void {
    this.updateArrowVisibility();

    window.addEventListener('resize', this.onResize);

    try {
      this.resizeObserver = new ResizeObserver(() =>
        this.updateArrowVisibility()
      );
      if (this.tabsContainer?.nativeElement) {
        this.resizeObserver.observe(this.tabsContainer.nativeElement);
      }
    } catch {}
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
    if (this.resizeObserver && this.tabsContainer?.nativeElement) {
      this.resizeObserver.unobserve(this.tabsContainer.nativeElement);
      this.resizeObserver.disconnect();
    }
  }

  private onResize = () => this.updateArrowVisibility();

  scrollTabs(direction: 'left' | 'right'): void {
    const el = this.tabsContainer?.nativeElement;
    if (!el) return;

    const scrollAmount = Math.round(el.clientWidth * 0.6);
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });

    setTimeout(() => this.updateArrowVisibility(), 300);
  }

  updateArrowVisibility(): void {
    const el = this.tabsContainer?.nativeElement;
    if (!el) return;

    const container = el.parentElement as HTMLElement | null;
    if (!container) return;

    const leftBtn = container.querySelector(
      '.scroll-btn.left'
    ) as HTMLElement | null;
    const rightBtn = container.querySelector(
      '.scroll-btn.right'
    ) as HTMLElement | null;

    if (!leftBtn || !rightBtn) return;

    if (el.scrollWidth <= el.clientWidth + 2) {
      leftBtn.classList.add('hidden');
      rightBtn.classList.add('hidden');
      return;
    }

    leftBtn.classList.remove('hidden');
    rightBtn.classList.remove('hidden');

    if (el.scrollLeft <= 2) leftBtn.classList.add('hidden');
    else leftBtn.classList.remove('hidden');

    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2)
      rightBtn.classList.add('hidden');
    else rightBtn.classList.remove('hidden');
  }
}
