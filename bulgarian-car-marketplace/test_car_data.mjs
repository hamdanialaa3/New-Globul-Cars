// اختبار سريع للبيانات الجديدة
import { getAllMakes, getModelsForMake, getGenerationsForModel, getBodyStylesForGeneration } from './src/constants/carData_static.ts';

console.log('عدد الشركات:', getAllMakes().length);
console.log('أول 5 شركات:', getAllMakes().slice(0, 5).map(m => m.text));

if (getAllMakes().length > 0) {
  const firstMake = getAllMakes()[0];
  console.log('موديلات ' + firstMake.text + ':', getModelsForMake(firstMake.value).length);

  if (getModelsForMake(firstMake.value).length > 0) {
    const firstModel = getModelsForMake(firstMake.value)[0];
    console.log('أجيال ' + firstModel.text + ':', getGenerationsForModel(firstMake.value, firstModel.value).length);
  }
}

console.log('عدد الشركات:', getAllMakes().length);
console.log('أول 5 شركات:', getAllMakes().slice(0, 5).map(m => m.text));

if (getAllMakes().length > 0) {
  const firstMake = getAllMakes()[0];
  console.log('موديلات ' + firstMake.text + ':', getModelsForMake(firstMake.value).length);

  if (getModelsForMake(firstMake.value).length > 0) {
    const firstModel = getModelsForMake(firstMake.value)[0];
    console.log('أجيال ' + firstModel.text + ':', getGenerationsForModel(firstMake.value, firstModel.value).length);
  }
}