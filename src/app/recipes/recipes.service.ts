import { Injectable } from '@angular/core';
import { Recipe } from './recipe.model';

@Injectable({
  providedIn: 'root',
})
export class RecipesService {
  private recipes: Recipe[] = [
    {
      id: 'r1',
      title: 'Tess',
      imageUrl: 'https://baconmockup.com/300/200',
      ingredients: ['French Fires', 'Pork Meat'],
    },
    {
      id: 'r2',
      title: 'International Mobility Producer',
      imageUrl: 'https://baconmockup.com/300/201',
      ingredients: ['Tomato', 'Salt'],
    },
  ];

  constructor() {}

  getAllRecipes() {
    return [...this.recipes];
  }

  getRecipe(recipeId: string) {
    return { ...this.recipes.find(recipe => recipe.id === recipeId) };
  }

  deleteRecipe(recipeId: string) {
    this.recipes = this.recipes.filter(recipe => recipe.id !== recipeId);
  }
}
