import { dateValidator } from "./date.validator";
import { rangeValidator } from "./range.validator";

export const DftValidators = {
  range: rangeValidator,
  date: dateValidator
}
