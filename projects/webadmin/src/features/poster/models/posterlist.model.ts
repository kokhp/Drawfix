import {
  UserRefModel,
  PageInfoTokenModel,
  SortingModel,
} from '../../../models/common.model';

export interface ListRequestModel {
  maxResults: number;
  pageToken?: string;
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
  sorting?: SortingModel;
}

export interface ListItemVideoStreamModel {
  url: string;
  type: 'M3U8' | 'MP4';
  quality: 'LOW' | 'MEDIUM' | 'HIGH' | '720P' | '1080P';
  qualityTag?: string;
  qualityLabel?: string;
  width?: number;
  height?: number;
}

export interface ListItemLanguageModel {
  id: string;
  name: string;
  altName?: string;
  iconText?: string;
}

export interface ListItemCategoryModel {
  id: string;
  name: string;
  createdAt?: Date;
  createdBy?: UserRefModel;
  isPublished: boolean;
  publishedAt?: Date;
  publishedBy?: UserRefModel;
}

export interface ListItemPartyStateModel {
  id: string;
  name: string;
  code?: string;
}

export interface ListItemPartyModel {
  id: string;
  name: string;
  shortName?: string;
  logoUrl?: string;
  createdAt?: string;
  createdBy?: UserRefModel;
  isPublished: boolean;
  publishedAt?: string;
  publishedBy?: UserRefModel;
  states?: ListItemPartyStateModel[];
}

export interface ListItemStatisticsModel {
  viewCount: number;
  editCount: number;
  shareCount: number;
  downloadCount: number;
}

export interface ListItemModel {
  id: string;
  type: 'PHOTO' | 'VIDEO';
  title: string;
  createdAt: Date;
  createdBy: UserRefModel;
  isPublished: boolean;
  publishedAt?: Date;
  publishedBy?: UserRefModel;
  posterUrl?: string;
  videoUrl?: string;
  videoStreams?: ListItemVideoStreamModel[];
  totalSize: number;
  isActive: boolean;
  isPremium: boolean;
  languages?: ListItemLanguageModel[];
  categories?: ListItemCategoryModel[];
  parties?: ListItemPartyModel[];
  statistics: ListItemStatisticsModel;
}

export interface ListResponse {
  items: ListItemModel[];
  pageInfo: PageInfoTokenModel;
}
