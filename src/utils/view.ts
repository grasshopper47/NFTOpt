export enum ViewTypes { CARDLIST, ROWLIST, DETAIL };

export type ViewConfig =
{
    type  : ViewTypes
,   state : number
}

export type ViewPage =
{
    index : number
,   count : number
};

export const ListViewStates = [ "S", "M", "L" ];

export const ListViewLimits  = [ 12, 24, 48 ];
export const TableViewLimits = [ 10, 20, 50 ];

export const storeViewType              = (type : ViewTypes) => localStorage[_viewTypeStorageKey]          = type;
export const storeViewState             = (state : number)   => localStorage[_viewStateStorageKey]         = state;
export const storeViewRecordsLimitIndex = (index : number)   => localStorage[_viewRecordsLimitStorageKey]  = index;

export const getViewSettingsFromStorage = () =>
{
    return {
        type  : parseInt(localStorage[_viewTypeStorageKey] ?? ViewTypes.CARDLIST)
    ,   state : parseInt(localStorage[_viewStateStorageKey] ?? 0)
    };
}

export const getViewLimitIndexFromStorage = () => parseInt(localStorage[_viewRecordsLimitStorageKey] ?? 0);

const _viewRecordsLimitStorageKey = "ViewRecordsLimit";
const _viewTypeStorageKey         = "ViewType";
const _viewStateStorageKey        = "ViewState";
