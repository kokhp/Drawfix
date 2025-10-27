export interface CategoryItem {
    id: string;
    title: string;
    description?: string;
    isActive?: boolean;
};

export interface CategoryRow {
    id: string;
    title: string;
    pinned: boolean;
    rulesCount: number;
    status: 'Active' | 'Inactive';
    position: number;
    posters: number;
    date: string; // formatted label e.g. 23 Dec, 24 05:30 AM
    createdBy: string; // user name
    dateType: 'Created' | 'Updated' | 'Modified';
    languages: string[]; // full language names or script labels
}