import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://umghgoiipdedbeulyvsf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZ2hnb2lpcGRlZGJldWx5dnNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUwNzI0NiwiZXhwIjoyMDgyMDgzMjQ2fQ.i2kXYJd9G966xXOLDZRXDzrpM9bdI1VurVvK_H74eSA'
);

async function fixRecipe(id: string, newRecipeText: string) {
  const { error } = await supabase
    .from('meals')
    .update({ recipe_text: newRecipeText })
    .eq('id', id);

  if (error) {
    console.error('Error updating recipe:', error);
  } else {
    console.log('Recipe updated successfully!');
  }
}

// Chicken Pozole - properly formatted
const chickenPozoleRecipe = `(1 SERVING)

INGREDIENTS:
• 1 cup chicken broth
• 4 oz shredded cooked chicken
• ½ cup canned hominy, rinsed
• ¼ tsp cumin
• ½ tsp chili powder
• 1 garlic clove, chopped (or ¼ tsp garlic powder)
• Salt and pepper to taste
• ¼ cup shredded cabbage
• 2-3 radish slices
• ¼ jalapeño, sliced
• 1 chopped avocado
• 1 tsp lime juice

INSTRUCTIONS:
1. COMBINE the first six ingredients in a small pot and season with salt and pepper to taste.
2. BRING to a boil over medium-high heat.
3. REDUCE heat and simmer for 10 minutes.
4. LADLE the soup into a bowl, top with shredded cabbage, radish slices, jalapeño, avocado, and lime juice. Serve hot.

Nutritional info per serving: 576 cal / 42g protein / 16g fiber`;

fixRecipe('fd831259-04d7-4650-91da-111d12513597', chickenPozoleRecipe);
