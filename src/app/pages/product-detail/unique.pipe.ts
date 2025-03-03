import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unique',
  pure: false, // Để cập nhật lại nếu có thay đổi dữ liệu
})
export class UniquePipe implements PipeTransform {
  transform(items: any[], field: string): any[] {
    if (!items || !field) {
      return items;
    }
    return items.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t[field] === item[field])
    );
  }
}
