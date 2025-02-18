import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTreeModule } from '@angular/material/tree'; // Import MatTreeModule
import { MatExpansionModule } from '@angular/material/expansion'; // Import thêm module này
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core'; // Không cần thiết nhưng có thể thêm
import { MatCheckboxModule } from '@angular/material/checkbox';
@NgModule({
  exports: [
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    FormsModule,  
    MatMenuModule, 
    MatTreeModule,
    MatExpansionModule, // Import thêm module này
    MatProgressSpinnerModule, // Import thêm module này
    MatProgressBarModule,
    MatDialogModule,
    MatSelectModule,
    MatOptionModule, 
    MatCheckboxModule, // Thêm module checkbox

  ]
})
export class MaterialModule { }
