export interface WindowSize {
  width: number;
  height: number;
}

export interface CacheModel {
  bypassCache: boolean;
}

export interface SortingModel {
  columnType: string;
  sortOrder: 'DESC' | 'ASC';
}

export interface PageInfoModel {
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PageInfoTokenModel {
  nextPageToken?: string;
  prevPageToken?: string;
}

export interface UserRefModel {
  id: string;
  name: string;
}
