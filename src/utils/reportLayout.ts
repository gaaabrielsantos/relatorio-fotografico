import type { ReportPhoto } from '../types/report'

export type PhotoPageLayout =
  | 'grid-2x2'
  | '2pt-1lb'
  | '1lt-2pb'
  | 'stacked-mixed'
  | 'stacked-portrait'
  | 'default-stacked'
  | 'single'

export interface PhotoPageGroup {
  layout: PhotoPageLayout
  photos: ReportPhoto[]
}

function isPortrait(photo: ReportPhoto | undefined): boolean {
  return Boolean(photo && photo.orientation !== 'landscape')
}

function isLandscape(photo: ReportPhoto | undefined): boolean {
  return photo?.orientation === 'landscape'
}

export function paginatePhotos(photos: ReportPhoto[]): PhotoPageGroup[] {
  const pages: PhotoPageGroup[] = []
  let index = 0

  while (index < photos.length) {
    const nextFour = photos.slice(index, index + 4)
    const nextThree = photos.slice(index, index + 3)
    const first = photos[index]
    const second = photos[index + 1]

    if (nextFour.length === 4 && nextFour.every(isPortrait)) {
      pages.push({ layout: 'grid-2x2', photos: nextFour })
      index += 4
      continue
    }

    if (
      nextThree.length === 3 &&
      isPortrait(nextThree[0]) &&
      isPortrait(nextThree[1]) &&
      isLandscape(nextThree[2])
    ) {
      pages.push({ layout: '2pt-1lb', photos: nextThree })
      index += 3
      continue
    }

    if (
      nextThree.length === 3 &&
      isLandscape(nextThree[0]) &&
      isPortrait(nextThree[1]) &&
      isPortrait(nextThree[2])
    ) {
      pages.push({ layout: '1lt-2pb', photos: nextThree })
      index += 3
      continue
    }

    if (isPortrait(first) && isLandscape(second)) {
      pages.push({ layout: 'stacked-mixed', photos: [first, second] })
      index += 2
      continue
    }

    if (isLandscape(first) && isPortrait(second)) {
      pages.push({ layout: 'stacked-mixed', photos: [first, second] })
      index += 2
      continue
    }

    if (isPortrait(first) && isPortrait(second)) {
      pages.push({ layout: 'stacked-portrait', photos: [first, second] })
      index += 2
      continue
    }

    const fallbackPhotos = photos.slice(index, index + 2)
    pages.push({
      layout: fallbackPhotos.length === 1 ? 'single' : 'default-stacked',
      photos: fallbackPhotos,
    })
    index += fallbackPhotos.length
  }

  return pages
}

export function buildPhotoPages(photos: ReportPhoto[]): ReportPhoto[][] {
  return paginatePhotos(photos).map((page) => page.photos)
}
