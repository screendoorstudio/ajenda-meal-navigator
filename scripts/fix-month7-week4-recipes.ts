import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://umghgoiipdedbeulyvsf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZ2hnb2lpcGRlZGJldWx5dnNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUwNzI0NiwiZXhwIjoyMDgyMDgzMjQ2fQ.i2kXYJd9G966xXOLDZRXDzrpM9bdI1VurVvK_H74eSA'
);

// Month 7 Week 4 Mix & Match Recipes extracted from PDF
const recipes: { [key: string]: string } = {
  // BREAKFAST ROTATION (Page 1)
  'Overnight Strawberry Oats': `Overnight Strawberry Oats (1 serving)

INGREDIENTS:
• 1/2 cup rolled oats
• 3/4 cup calcium-fortified unsweetened almond milk (or milk of choice)
• 1 scoop protein powder
• 1 cup halved strawberries

INSTRUCTIONS:
1. COMBINE oats, milk, and protein powder in a bowl or glass jar.
2. COVER and refrigerate overnight.
3. In the morning, stir in strawberries.

Nutritional info per serving: 333 cal / 28g protein / 9g fiber

IF YOU WEIGH ~175 POUNDS: Add 13g (~2 tsp) more protein powder.`,

  'Veggie-Egg Scramble with Berries': `Veggie-Egg Scramble with Berries (1 serving)

INGREDIENTS:
• Cooking spray
• 1/2 cup halved grape tomatoes
• 2 cups fresh baby spinach
• 2 large eggs, lightly beaten
• 1 1/2 oz feta cheese, crumbled
• Salt and pepper to taste
• 3/4 cup blackberries

INSTRUCTIONS:
1. HEAT a small nonstick skillet over medium. Coat pan with cooking spray.
2. ADD tomatoes and cook until slightly softened, about 1 minute. Gradually add spinach, stirring until it wilts.
3. ADD eggs and cheese to pan. Cook until eggs are set, 1-2 minutes, stirring constantly to scramble. Season with salt and pepper.
4. SERVE scramble with berries on the side.

Nutritional info per serving: 336 cal / 23g protein / 9g fiber

IF YOU WEIGH ~175 POUNDS: Add 3 lightly beaten egg whites to scramble.`,

  'Cinnamon-Apple Yogurt Bowl': `Cinnamon-Apple Yogurt Bowl (1 serving)

INGREDIENTS:
• 1 cup plain whole milk Greek yogurt
• 1 tbsp chia seeds
• 1 small apple, chopped
• 1/4 tsp ground cinnamon

INSTRUCTIONS:
1. SPOON yogurt into a medium bowl and sprinkle with chia seeds.
2. TOP with apple and cinnamon.

Nutritional info per serving: 358 cal / 23g protein / 8g fiber

IF YOU WEIGH ~175 POUNDS: Stir 13g (~2 tsp) unflavored protein powder into yogurt.`,

  // LUNCH ROTATION (Page 2)
  'Turkey-Avocado Lettuce Wraps': `Turkey-Avocado Lettuce Wraps (1 serving)

INGREDIENTS:
• 3 large romaine lettuce leaves
• 3 oz roasted turkey breast, thinly sliced
• 1/2 ripe avocado, sliced
• 1 tbsp sunflower seeds

INSTRUCTIONS:
1. ARRANGE lettuce leaves on a plate.
2. DIVIDE turkey, avocado, and sunflower seeds evenly among leaves.
3. Roll up leaves to form wraps.

Nutritional info per serving: 304 cal / 29g protein / 8g fiber

IF YOU WEIGH ~175 POUNDS: Increase turkey to 4 1/2 oz.`,

  'Lentil & Greens Salad': `Lentil & Greens Salad (1 serving)

INGREDIENTS:
• 1 tbsp red wine vinegar
• 2 tsp extra-virgin olive oil
• 1/2 tsp Italian seasoning
• 2 cups mixed greens
• 1 cup cooked lentils
• 1/4 cup chopped cucumber
• 1/4 cup shredded carrots
• Salt and pepper to taste
• 1 tbsp grated Parmesan
• 1 tbsp chopped almonds

INSTRUCTIONS:
1. WHISK vinegar, oil, and Italian seasoning in a medium bowl.
2. ADD mixed greens, lentils, cucumber, and carrots and toss to coat. Season with salt and pepper.
3. TOP salad with cheese and nuts.

Nutritional info per serving: 380 cal / 21g protein / 17g fiber

IF YOU WEIGH ~175 POUNDS: Add 2 1/2 oz cubed tofu to salad.`,

  'Tuna & Chickpea Salad': `Tuna & Chickpea Salad (1 serving)

INGREDIENTS:
• 2 tsp red wine vinegar
• 1 1/2 tsp extra-virgin olive oil
• 1/2 tsp Italian seasoning
• 1/4 tsp garlic powder
• Salt and pepper to taste
• 2 cups baby spinach
• 1/2 cup canned chickpeas, rinsed and drained
• 3 oz water-packed tuna, drained and flaked

INSTRUCTIONS:
1. WHISK vinegar, oil, Italian seasoning, garlic powder, and salt and pepper in a medium bowl.
2. ADD spinach, chickpeas, and tuna and toss gently to coat.

Nutritional info per serving: 298 cal / 29g protein / 8g fiber

IF YOU WEIGH ~175 POUNDS: Increase tuna to 5 oz.`,

  // SNACK ROTATION (Page 2)
  'Cottage Cheese & Blackberries': `Cottage Cheese & Blackberries (1 serving)

INGREDIENTS:
• 1/2 cup whole milk cottage cheese
• 2/3 cup blackberries

INSTRUCTIONS:
1. TOP cottage cheese with blackberries in a medium bowl.

Nutritional info per serving: 163 cal / 14g protein / 5g fiber

IF YOU WEIGH ~175 POUNDS: Stir 4g (~1 tsp) unflavored protein powder into cottage cheese.`,

  'PB Yogurt & Berries': `PB Yogurt & Berries (1 serving)

INGREDIENTS:
• 1 tbsp powdered peanut butter
• 1/2 cup plain whole milk Greek yogurt
• 1 cup halved strawberries

INSTRUCTIONS:
1. STIR powdered peanut butter into yogurt in a medium bowl.
2. TOP with strawberries.

Nutritional info per serving: 184 cal / 14g protein / 4g fiber

IF YOU WEIGH ~175 POUNDS: Stir 4g (~1 tsp) unflavored protein powder into yogurt.`,

  'Crispbread with Fig': `Crispbread with Fig (1 serving)

INGREDIENTS:
• 1/4 cup whole milk cottage cheese
• 1 multigrain crispbread
• 1 halved dried fig

INSTRUCTIONS:
1. SPREAD cottage cheese over crispbread.
2. TOP with halved dried fig.

Nutritional info per serving: 116 cal / 9g protein / 4g fiber

IF YOU WEIGH ~175 POUNDS: Add 1/2 cup calcium-fortified unsweetened soy milk.`,

  // DINNER ROTATION (Page 3)
  'Salmon Rice Bowl': `Salmon Rice Bowl (2 servings)

INGREDIENTS:
• 1 cup cooked brown rice
• 1/2 cup shelled edamame
• 1 Persian (mini) cucumber, chopped
• 1 ripe avocado, chopped
• 6 oz canned wild salmon, drained and flaked
• 2 tbsp chopped green onions
• 2 tsp low-sodium soy sauce

INSTRUCTIONS:
1. DIVIDE rice evenly between 2 shallow bowls.
2. TOP rice evenly with edamame, cucumber, avocado, salmon, and green onions.
3. DRIZZLE 1 tsp soy sauce over each bowl.

Nutritional info per serving: 400 cal / 27g protein / 9g fiber

IF YOU WEIGH ~175 POUNDS: Increase salmon to 10 oz.`,

  'Chicken & Warm White Bean Salad': `Chicken & Warm White Bean Salad (2 servings)

INGREDIENTS:
• 1 tbsp extra-virgin olive oil
• 2 garlic cloves, minced
• 1 cup canned cannellini beans, rinsed and drained
• 1 cup halved cherry tomatoes
• 4 cups fresh baby spinach
• 2 tbsp fresh lemon juice
• 4 oz grilled chicken breast, chopped
• Salt and pepper to taste

INSTRUCTIONS:
1. HEAT oil in a large skillet over medium. Add garlic and cook until fragrant, about 1 minute.
2. ADD beans and tomatoes to pan and cook until warmed, 2-3 minutes. Gradually add spinach, stirring until it wilts.
3. STIR in lemon juice and chicken. Season with salt and pepper.

Nutritional info per serving: 333 cal / 30g protein / 9g fiber

IF YOU WEIGH ~175 POUNDS: Increase chicken to 7 oz.`,
};

async function updateRecipes() {
  console.log('Updating Month 7 Week 4 Mix & Match recipes...\n');

  let updatedCount = 0;
  let notFoundCount = 0;

  for (const [mealName, recipeText] of Object.entries(recipes)) {
    // Find the meal in Month 7 Week 4
    const { data: meals, error: findError } = await supabase
      .from('meals')
      .select('id, name, recipe_text, day')
      .eq('phase_id', 'm7')
      .eq('week', 4)
      .ilike('name', `%${mealName}%`);

    if (findError) {
      console.error(`Error finding ${mealName}:`, findError);
      continue;
    }

    if (!meals || meals.length === 0) {
      console.log(`NOT FOUND: ${mealName}`);
      notFoundCount++;
      continue;
    }

    for (const meal of meals) {
      // Only update if recipe is null or empty
      if (!meal.recipe_text) {
        const { error: updateError } = await supabase
          .from('meals')
          .update({ recipe_text: recipeText })
          .eq('id', meal.id);

        if (updateError) {
          console.error(`Error updating ${meal.name}:`, updateError);
        } else {
          console.log(`UPDATED: ${meal.name} (Day ${meal.day})`);
          updatedCount++;
        }
      } else {
        console.log(`SKIPPED (already has recipe): ${meal.name}`);
      }
    }
  }

  console.log(`\nSummary:`);
  console.log(`  Updated: ${updatedCount}`);
  console.log(`  Not found: ${notFoundCount}`);
}

updateRecipes();
