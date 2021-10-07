import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchDialogContentComponent } from './search-dialog-content.component';

describe('SearchDialogContentComponent', () => {
  let component: SearchDialogContentComponent;
  let fixture: ComponentFixture<SearchDialogContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchDialogContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchDialogContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
