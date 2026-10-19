import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';
import { FEATURES } from './feature-schema';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('renders one input per model feature', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const inputs = (fixture.nativeElement as HTMLElement).querySelectorAll('input');
    expect(inputs.length).toBe(FEATURES.length);
    expect(FEATURES.length).toBe(90);
  });

  it('blocks submission when a field is empty', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.componentInstance.submit();
    expect(fixture.componentInstance.error()).toContain('Enter a value for');
  });

  it('shows the predicted year after the API answers', async () => {
    const fixture = TestBed.createComponent(App);
    const http = TestBed.inject(HttpTestingController);
    fixture.componentInstance.fillSample();
    fixture.componentInstance.submit();

    const req = http.expectOne('/api/predict');
    expect(Object.keys(req.request.body).length).toBe(90);
    req.flush({ prediction: 1992.4, task: 'regression', unit: 'year', disclaimer: 'Research/teaching prototype only.' });

    await fixture.whenStable();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Predicted release year: 1992');
  });

  it('shows a visible error when the API fails', async () => {
    const fixture = TestBed.createComponent(App);
    const http = TestBed.inject(HttpTestingController);
    fixture.componentInstance.fillSample();
    fixture.componentInstance.submit();
    http.expectOne('/api/predict').flush({ error: 'Input schema mismatch' }, { status: 400, statusText: 'Bad Request' });

    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('API error 400');
  });
});
