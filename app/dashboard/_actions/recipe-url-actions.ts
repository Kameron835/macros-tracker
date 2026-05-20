'use server'

import * as cheerio from 'cheerio'

type ExtractedRecipe = {
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
}

function cleanText(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((v) => cleanText(v)).filter(Boolean))]
}

export async function extractRecipeFromUrl(
  url: string
): Promise<ExtractedRecipe> {
  if (!url || !url.startsWith('http')) {
    throw new Error('Please enter a valid recipe URL.')
  }

  let html = ''

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Could not fetch recipe page.')
    }

    html = await response.text()
  } catch {
    throw new Error('Failed to fetch recipe website.')
  }

  const $ = cheerio.load(html)

  let title =
    cleanText($('meta[property="og:title"]').attr('content') || '') ||
    cleanText($('title').text()) ||
    'Imported Recipe'

  let description =
    cleanText($('meta[name="description"]').attr('content') || '') ||
    cleanText($('meta[property="og:description"]').attr('content') || '')

  let ingredients: string[] = []
  let instructions: string[] = []

  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      const raw = $(element).html()

      if (!raw) return

      const parsed = JSON.parse(raw)

      const items = Array.isArray(parsed) ? parsed : [parsed]

      for (const item of items) {
        const recipe =
          item['@type'] === 'Recipe'
            ? item
            : Array.isArray(item['@graph'])
            ? item['@graph'].find((g: any) => g['@type'] === 'Recipe')
            : null

        if (!recipe) continue

        if (recipe.name) {
          title = cleanText(recipe.name)
        }

        if (recipe.description) {
          description = cleanText(recipe.description)
        }

        if (Array.isArray(recipe.recipeIngredient)) {
          ingredients.push(...recipe.recipeIngredient.map(cleanText))
        }

        if (Array.isArray(recipe.recipeInstructions)) {
          for (const instruction of recipe.recipeInstructions) {
            if (typeof instruction === 'string') {
              instructions.push(cleanText(instruction))
            } else if (instruction?.text) {
              instructions.push(cleanText(instruction.text))
            }
          }
        }
      }
    } catch {
      // ignore bad json
    }
  })

  if (ingredients.length === 0) {
    $('li').each((_, el) => {
      const text = cleanText($(el).text())

      if (
        text.length > 3 &&
        text.length < 200 &&
        /\d/.test(text) &&
        !ingredients.includes(text)
      ) {
        ingredients.push(text)
      }
    })
  }

  if (instructions.length === 0) {
    $('p').each((_, el) => {
      const text = cleanText($(el).text())

      if (
        text.length > 40 &&
        text.length < 400 &&
        !instructions.includes(text)
      ) {
        instructions.push(text)
      }
    })
  }

  ingredients = uniqueStrings(ingredients).slice(0, 100)
  instructions = uniqueStrings(instructions).slice(0, 50)

  return {
    title,
    description,
    ingredients,
    instructions,
  }
}