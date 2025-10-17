import { CacheModel } from "../../../models/common.model";

export interface ListRequestProjectModel {
  code: boolean; // Include state code (short identifier)
  isMain: boolean; // Include whether the state is main/primary
  isActive: boolean; // Include active/inactive status
}

export interface ListRequestModel extends CacheModel {
  ids?: string[]; // Filter by state IDs
  limit?: number; // Maximum number of records to return
  skip?: number; // Number of records to skip (pagination)
  project?: ListRequestProjectModel; // Fields to include in response
}

export interface ListItemModel {
  id: string; // Unique identifier of the state
  name: string; // Full name of the state
  code?: string; // Short code of the state
  isMain?: boolean; // Whether the state is main/primary
  isActive?: boolean; // Whether the state is active
}
