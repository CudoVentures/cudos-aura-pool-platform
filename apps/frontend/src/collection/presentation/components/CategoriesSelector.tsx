import LoadingIndicator from '../../../core/presentation/components/LoadingIndicator';
import S from '../../../core/utilities/Main';
import { inject, observer } from 'mobx-react';
import React, { useEffect } from 'react';
import CategoriesStore from '../stores/CategoriesStore';

import '../styles/categories-selector.css';

type Props = {
    categoriesStore?: CategoriesStore,
    selectedCategoryIds: string[];
    onChangeCategories: (categoryIds: string[]) => void;
}

function CategoriesSelector({ categoriesStore, selectedCategoryIds, onChangeCategories }: Props) {

    useEffect(() => {
        categoriesStore.init();
    });

    function onChangeCategoryIds(categoryId) {
        const i = selectedCategoryIds.indexOf(categoryId);
        if (i === -1) {
            onChangeCategories(selectedCategoryIds.concat([categoryId]));
        } else {
            onChangeCategories(selectedCategoryIds.filter((existingCategoryId) => {
                return existingCategoryId !== categoryId;
            }));
        }
    }

    return (
        <div className={'CategoriesSelector FlexRow'}>
            { categoriesStore.categoryEntities === null && (
                <LoadingIndicator />
            ) }

            { categoriesStore.categoryEntities?.map((categoryEntity) => {
                return (
                    <div
                        key={categoryEntity.categoryId}
                        onClick={() => onChangeCategoryIds(categoryEntity.categoryId)}
                        className={`CategoryName Clickable B2 SemiBold Transition ${S.CSS.getActiveClassName(selectedCategoryIds.includes(categoryEntity.categoryId))}`} >
                        {categoryEntity.categoryName}
                    </div>
                )
            }) }
        </div>
    )

}

export default inject((stores) => stores)(observer(CategoriesSelector));
