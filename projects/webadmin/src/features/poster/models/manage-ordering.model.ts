import {
  UserRefModel,
  PageInfoTokenModel,
} from '../../../models/common.model';

export interface ManageOrderingListRequestModel {
  maxResults: number;
  active?: boolean;
  posterType?: string;
  languageIds?: string[];
  publishedFrom?: number | null;
  publisheTo?: number | null;
  createdFrom?: number | null;
  createdTo?: number | null;
  political?: boolean;
  partyId?: string;
  stateId?: string;
  categoryId?: string;
}

export interface ManageOrderingListItemLanguageModel {
  id: string;
  name: string;
  altName?: string;
  iconText?: string;
}

export interface ManageOrderingListItemCategoryModel {
  id: string;
  name: string;
  createdAt?: Date;
  createdBy?: UserRefModel;
  isPublished: boolean;
  publishedAt?: Date;
  publishedBy?: UserRefModel;
}

export interface ManageOrderingListItemModel {
  id: string;
  title: string;
  createdAt: Date;
  isPublished: boolean;
  publishedAt?: Date;
  posterUrl?: string;
  isActive: boolean;
  languages?: ManageOrderingListItemLanguageModel[];
  categories?: ManageOrderingListItemCategoryModel[];
}

export interface ManageOrderingListResponse {
  items: ManageOrderingListItemModel[];
  pageInfo: PageInfoTokenModel;
}
