import type { ReportPhoto } from '../types/report'

function isPortraitLike(photo: ReportPhoto): boolean {
  return photo.orientation !== 'landscape'
}

export function buildPhotoRows(pagePhotos: ReportPhoto[]): ReportPhoto[][] {
  if (pagePhotos.length === 0) {
    return []
  }

  if (pagePhotos.length === 3) {
    const first = pagePhotos[0]
    const second = pagePhotos[1]
    const third = pagePhotos[2]

    const isPortraitTriplet =
      isPortraitLike(first) &&
      second &&
      isPortraitLike(second) &&
      third &&
      third.orientation === 'landscape'

    const isLandscapeTriplet =
      first?.orientation === 'landscape' &&
      second &&
      isPortraitLike(second) &&
      third &&
      isPortraitLike(third)

    if (isPortraitTriplet) {
      return [[first, second], [third]]
    }

    if (isLandscapeTriplet) {
      return [[first], [second, third]]
    }
  }

  return pagePhotos.map((photo) => [photo])
}

export function buildPhotoPages(photos: ReportPhoto[]): ReportPhoto[][] {
  const pages: ReportPhoto[][] = []
  let index = 0

  while (index < photos.length) {
    const current = photos[index]
    const next = photos[index + 1]
    const third = photos[index + 2]

    if (!current) {
      break
    }

    const isPortraitTriplet =
      isPortraitLike(current) &&
      next &&
      isPortraitLike(next) &&
      third &&
      third.orientation === 'landscape'

    const isLandscapeTriplet =
      current.orientation === 'landscape' &&
      next &&
      isPortraitLike(next) &&
      third &&
      isPortraitLike(third)

    if (isPortraitTriplet || isLandscapeTriplet) {
      pages.push([current, next, third])
      index += 3
      continue
    }

    const page = [current]
    if (next) {
      page.push(next)
    }

    pages.push(page)
    index += 2
  }

  return pages
}
