import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://umghgoiipdedbeulyvsf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZ2hnb2lpcGRlZGJldWx5dnNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUwNzI0NiwiZXhwIjoyMDgyMDgzMjQ2fQ.i2kXYJd9G966xXOLDZRXDzrpM9bdI1VurVvK_H74eSA'
);

// Month 7 Week 2 & 3 Mix & Match Recipes extracted from PDFs
const recipes: { [key: string]: { week: number; recipe: string } } = {
  // ============ WEEK 2 RECIPES ============

  // BREAKFAST ROTATION (Week 2, Page 2)
  'Protein Smoothie': {
    week: 2,
    recipe: `Protein Smoothie (1 serving)

INGREDIENTS:
• 1 cup calcium-fortified unsweetened almond milk (or milk of choice)
• 1 cup fresh baby spinach
• 1 cup frozen mixed berries
• 1 tbsp ground flaxseed
• 1 scoop unflavored protein powder
• 1/4 ripe avocado

INSTRUCTIONS:
1. ADD all ingredients to a blender.
2. BLEND until smooth, adding a splash of water if mixture is too thick.

Nutritional info per serving: 313 cal / 27g protein / 9g fiber

IF YOU WEIGH ~175 POUNDS: Add 13g (~2 tsp) more protein powder.`
  },

  'Egg Scramble with Toast': {
    week: 2,
    recipe: `Egg Scramble with Toast (1 serving)

INGREDIENTS:
• 1 tsp extra-virgin olive oil
• 1/2 cup sliced mushrooms
• 1 cup fresh baby spinach
• 2 large eggs, lightly beaten
• Salt and pepper to taste
• 1 slice sprouted wheat bread, toasted

INSTRUCTIONS:
1. HEAT oil in a small nonstick skillet over medium-high. Add mushrooms and cook until softened, 2-3 minutes. Gradually add spinach, stirring until it wilts.
2. REDUCE heat to medium-low. Add eggs to pan. Cook, stirring constantly, until eggs are set, 1-2 minutes. Season with salt and pepper.
3. SERVE scramble with toast.

Nutritional info per serving: 306 cal / 22g protein / 6g fiber

IF YOU WEIGH ~175 POUNDS: Add 3 lightly beaten egg whites to scramble.`
  },

  'Yogurt Bowl with Chia & Berries': {
    week: 2,
    recipe: `Yogurt Bowl with Chia & Berries (1 serving)

INGREDIENTS:
• 3/4 cup plain whole milk Greek yogurt
• 2 tbsp chia seeds
• 1 tsp honey
• 1/2 cup raspberries

INSTRUCTIONS:
1. STIR together yogurt, chia seeds, and honey in a medium bowl.
2. TOP with raspberries.

Nutritional info per serving: 326 cal / 20g protein / 12g fiber

IF YOU WEIGH ~175 POUNDS: Stir 13g (~2 tsp) unflavored protein powder into yogurt.`
  },

  // LUNCH ROTATION (Week 2, Page 3)
  'Chicken & Mixed Greens': {
    week: 2,
    recipe: `Chicken & Mixed Greens (1 serving)

INGREDIENTS:
• 2 cups mixed greens
• 1/2 cup halved grape tomatoes
• 1 Persian cucumber, sliced
• 1 tbsp extra-virgin olive oil
• 1 tbsp balsamic vinegar
• Salt and pepper to taste
• 3 oz grilled chicken breast, sliced
• 1 tbsp crumbled feta cheese

INSTRUCTIONS:
1. COMBINE greens, tomatoes, and cucumber in a medium bowl.
2. DRIZZLE salad with oil and vinegar and season with salt and pepper. Toss gently to combine.
3. TOP salad with chicken and feta.

Nutritional info per serving: 376 cal / 29g protein / 5g fiber

IF YOU WEIGH ~175 POUNDS: Increase chicken to 4 1/3 oz.`
  },

  'Lentil Soup with Cottage Cheese Toast': {
    week: 2,
    recipe: `Lentil Soup with Cottage Cheese Toast (1 serving)

INGREDIENTS:
• 1 cup canned lentil soup
• 1 slice sprouted wheat bread, toasted
• 1/4 cup whole milk cottage cheese
• 1 cup baby carrots

INSTRUCTIONS:
1. HEAT soup according to label directions.
2. TOP toast with cottage cheese.
3. SERVE soup with toast and carrots on the side.

Nutritional info per serving: 389 cal / 23g protein / 13g fiber

IF YOU WEIGH ~175 POUNDS: Stir 2 1/2 oz cubed firm calcium-set tofu into soup.`
  },

  'Chickpea & Shrimp Salad': {
    week: 2,
    recipe: `Chickpea & Shrimp Salad (1 serving)

INGREDIENTS:
• 1/2 cup canned chickpeas, rinsed and drained
• 1/2 cup halved grape tomatoes
• 2 tbsp chopped fresh parsley
• 1 Persian cucumber, chopped
• 3 oz cooked shrimp
• 1 tbsp extra-virgin olive oil
• 1 tbsp fresh lemon juice
• Salt and pepper to taste

INSTRUCTIONS:
1. COMBINE chickpeas, tomatoes, parsley, cucumber, and shrimp in a medium bowl.
2. DRIZZLE salad with oil and lemon juice and season with salt and pepper. Toss gently to combine.

Nutritional info per serving: 381 cal / 26g protein / 9g fiber

IF YOU WEIGH ~175 POUNDS: Increase shrimp to 4 1/2 oz.`
  },

  // DINNER ROTATION (Week 2, Page 4)
  'Salmon with Zucchini & Sweet Potato': {
    week: 2,
    recipe: `Salmon with Zucchini & Sweet Potato (2 servings)

INGREDIENTS:
• 2 4-oz salmon fillets
• Cooking spray
• Salt and pepper to taste
• 1 tbsp extra-virgin olive oil
• 3 cups sliced zucchini
• 2 small sweet potatoes, baked

INSTRUCTIONS:
1. HEAT a large nonstick skillet over medium-high. Coat salmon fillets with cooking spray and season with salt and pepper.
2. ADD salmon to pan and cook until fish flakes easily, 3-5 minutes per side. Remove from pan.
3. ADD oil to pan and swirl to coat. Add zucchini and salt and pepper and sauté until crisp-tender, 3-5 minutes.
4. SERVE salmon and zucchini with sweet potatoes.

Nutritional info per serving: 375 cal / 33g protein / 5g fiber

IF YOU WEIGH ~175 POUNDS: Increase each salmon fillet to 5 1/2 oz.`
  },

  'Tofu Dinner Salad': {
    week: 2,
    recipe: `Tofu Dinner Salad (2 servings)

INGREDIENTS:
• 2 tbsp fresh lemon juice
• 1 tbsp extra-virgin olive oil
• 1 tsp Dijon mustard
• Salt and pepper to taste
• 4 cups mixed greens
• 8 oz firm calcium-set tofu, cubed
• 1/4 cup crumbled feta cheese
• 1/2 ripe avocado, cubed
• 2 tbsp pumpkin seeds

INSTRUCTIONS:
1. WHISK together lemon juice, oil, mustard, and salt and pepper in a large bowl.
2. ADD greens, tofu, cheese, and avocado and toss gently to coat.
3. DIVIDE salad evenly between 2 bowls. Top each serving with 1 tbsp pumpkin seeds.

Nutritional info per serving: 387 cal / 24g protein / 7g fiber

IF YOU WEIGH ~175 POUNDS: Increase tofu to 13 oz (6 1/2 oz per serving) and decrease cheese to 2 tbsp (1 tbsp per serving).`
  },

  // SPECIAL EXCEPTION DINNERS (Week 2, Page 4)
  'BBQ Night': {
    week: 2,
    recipe: `BBQ Night (Special Exception Dinner)

This is a restaurant-style meal option to enjoy once per week.

SUGGESTED ORDER:
• 4 oz grilled chicken or lean brisket
• Side of coleslaw
• Skip heavy sauces

Note: This will land around 500-600 calories, so balance by choosing a lighter snack or breakfast that day.`
  },

  'Pizza Night': {
    week: 2,
    recipe: `Pizza Night (Special Exception Dinner)

This is a restaurant-style meal option to enjoy once per week.

SUGGESTED ORDER:
• 2 slices small thin-crust veggie pizza
• Side salad

Note: This will land around 500-600 calories, so balance by choosing a lighter snack or breakfast that day.`
  },

  'Sushi Night': {
    week: 2,
    recipe: `Sushi Night (Special Exception Dinner)

This is a restaurant-style meal option to enjoy once per week.

SUGGESTED ORDER:
• 6 pieces salmon/tuna sushi
• Seaweed salad
• Skip fried rolls

Note: This will land around 500-600 calories, so balance by choosing a lighter snack or breakfast that day.`
  },

  // ============ WEEK 3 RECIPES ============

  // BREAKFAST ROTATION (Week 3, Page 1)
  'Berry-Chia Cottage Cheese Bowl': {
    week: 3,
    recipe: `Berry-Chia Cottage Cheese Bowl (1 serving)

INGREDIENTS:
• 3/4 cup whole milk cottage cheese
• 1 tbsp chia seeds
• 1/2 cup sliced strawberries
• 1 tbsp almond butter

INSTRUCTIONS:
1. SPOON cottage cheese into a medium bowl.
2. TOP with chia seeds and strawberries. Drizzle with almond butter.

Nutritional info per serving: 343 cal / 27g protein / 7g fiber

IF YOU WEIGH ~175 POUNDS: Stir 13g (~2 tsp) unflavored protein powder into cottage cheese.`
  },

  'Avocado Toast & Scrambled Eggs': {
    week: 3,
    recipe: `Avocado Toast & Scrambled Eggs (1 serving)

INGREDIENTS:
• Cooking spray
• 2 large eggs, lightly beaten
• 2 tbsp whole milk cottage cheese
• Salt and pepper to taste
• 1 slice sprouted wheat bread, toasted
• 1/4 ripe avocado, sliced
• Pinch of crushed red pepper flakes
• 1 lemon wedge

INSTRUCTIONS:
1. HEAT a small nonstick skillet over medium-low. Coat pan with cooking spray. Add eggs, cottage cheese, and salt and pepper. Cook until eggs are set, 2-3 minutes, stirring constantly to scramble.
2. TOP toast with avocado. Sprinkle with pepper flakes and squeeze lemon on top.
3. SERVE toast with scrambled eggs.

Nutritional info per serving: 346 cal / 23g protein / 8g fiber

IF YOU WEIGH ~175 POUNDS: Add 3 lightly beaten egg whites to scramble.`
  },

  // LUNCH ROTATION (Week 3, Page 2)
  'Turkey & Avocado Wrap': {
    week: 3,
    recipe: `Turkey & Avocado Wrap (1 serving)

INGREDIENTS:
• 1 tbsp hummus
• 1 45-g high-fiber tortilla wrap
• 3 oz roasted turkey breast, sliced
• 1 cup mixed greens
• 1/4 ripe avocado, sliced

INSTRUCTIONS:
1. SPREAD hummus down the center of tortilla wrap.
2. TOP with turkey, greens, and avocado.
3. Roll up.

Nutritional info per serving: 295 cal / 32g protein / 15g fiber

IF YOU WEIGH ~175 POUNDS: Increase turkey to 4 1/2 oz.`
  },

  // DINNER ROTATION (Week 3, Page 3)
  'Tofu-Vegetable Stir-Fry with Soba': {
    week: 3,
    recipe: `Tofu-Vegetable Stir-Fry with Soba (2 servings)

INGREDIENTS:
• 1 tbsp toasted sesame oil
• 12 oz firm calcium-set tofu, cubed
• 3 cups coarsely chopped bok choy
• 1/2 cup thinly sliced carrots
• 8 oz sliced cremini mushrooms
• 2 garlic cloves, minced
• 1/2 cup shelled edamame
• 2 tbsp low-sodium soy sauce
• 2 cups cooked soba (buckwheat noodles)

INSTRUCTIONS:
1. HEAT oil in a wok or large skillet over medium-high. Add tofu and stir-fry until crisp, about 5 minutes.
2. ADD bok choy, carrots, mushrooms, and garlic to pan. Stir-fry until crisp-tender, 3-5 minutes. Stir in edamame and soy sauce.
3. DIVIDE soba evenly between 2 shallow bowls. Divide stir-fry evenly between bowls.

Nutritional info per serving: 412 cal / 30g protein / 9g fiber

IF YOU WEIGH ~175 POUNDS: Increase tofu to 16 oz and edamame to 3/4 cup; decrease oil to 2 tsp.`
  },

  'Miso Cod & Pilaf': {
    week: 3,
    recipe: `Miso Cod & Pilaf (2 servings)

INGREDIENTS:
• 2 tsp white miso
• 1 tbsp toasted sesame oil, divided
• 2 4-oz cod fillets
• Cooking spray
• 1 cup cooked brown rice
• 1 cup canned quartered artichoke hearts, drained
• 1/2 cup shredded carrots
• Salt and pepper to taste

INSTRUCTIONS:
1. PREHEAT broiler to high.
2. STIR together miso and 1 tsp of the oil in a small bowl. Spread mixture evenly over cod. Arrange cod on a small foil-lined sheet pan coated with cooking spray.
3. BROIL until fish flakes easily, 8-10 minutes.
4. HEAT remaining 2 tsp oil in a medium skillet over medium-high. Add rice, artichoke hearts, carrots, and salt and pepper. Cook until heated through, 2-3 minutes.
5. SERVE pilaf with cod.

Nutritional info per serving: 332 cal / 26g protein / 8g fiber

IF YOU WEIGH ~175 POUNDS: Increase each cod fillet to 6 oz.`
  },

  'Chicken & Broccoli Farro Bowl': {
    week: 3,
    recipe: `Chicken & Broccoli Farro Bowl (2 servings)

INGREDIENTS:
• 2 tsp extra-virgin olive oil
• 8 oz boneless, skinless chicken breast, cut into bite-size pieces
• Salt and pepper to taste
• 3 cups broccoli florets
• 2 garlic cloves, minced
• 1 cup cooked farro
• 2 tsp toasted sesame seeds

INSTRUCTIONS:
1. HEAT oil in a large skillet over medium-high. Add chicken and salt and pepper and sauté until chicken is cooked through, 5-6 minutes.
2. ADD broccoli and garlic to pan. Cover and cook until broccoli is crisp-tender, 3-4 minutes.
3. DIVIDE farro evenly between 2 shallow bowls. Divide chicken mixture evenly between bowls. Top each serving with 1 tsp sesame seeds.

Nutritional info per serving: 364 cal / 32g protein / 7g fiber

IF YOU WEIGH ~175 POUNDS: Increase chicken to 11 1/2 oz.`
  },
};

async function updateRecipes() {
  console.log('Updating Month 7 Week 2 & 3 Mix & Match recipes...\n');

  let updatedCount = 0;
  let notFoundCount = 0;
  let skippedCount = 0;

  for (const [mealName, { week, recipe }] of Object.entries(recipes)) {
    // Find the meal in Month 7 with the specified week
    const { data: meals, error: findError } = await supabase
      .from('meals')
      .select('id, name, recipe_text, day')
      .eq('phase_id', 'm7')
      .eq('week', week)
      .ilike('name', `%${mealName}%`);

    if (findError) {
      console.error(`Error finding ${mealName}:`, findError);
      continue;
    }

    if (!meals || meals.length === 0) {
      console.log(`NOT FOUND: ${mealName} (Week ${week})`);
      notFoundCount++;
      continue;
    }

    for (const meal of meals) {
      // Only update if recipe is null or empty
      if (!meal.recipe_text) {
        const { error: updateError } = await supabase
          .from('meals')
          .update({ recipe_text: recipe })
          .eq('id', meal.id);

        if (updateError) {
          console.error(`Error updating ${meal.name}:`, updateError);
        } else {
          console.log(`UPDATED: ${meal.name} (Week ${week}, Day ${meal.day})`);
          updatedCount++;
        }
      } else {
        console.log(`SKIPPED (already has recipe): ${meal.name}`);
        skippedCount++;
      }
    }
  }

  console.log(`\nSummary:`);
  console.log(`  Updated: ${updatedCount}`);
  console.log(`  Skipped: ${skippedCount}`);
  console.log(`  Not found: ${notFoundCount}`);
}

updateRecipes();
