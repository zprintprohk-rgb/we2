/**
 * /pet — Virtual Pet → 灵魂伴侣情感中枢 (Fusion v2)
 *
 * Server entry：调用 setRequestLocale + getTranslations 注入 SEO metadata，
 * 实际交互（mood 切换 / 全屏召唤阵 / 抚摸）由 PetDetailClient 渲染。
 *
 * 战略：选择宠物是"召唤灵魂伴侣"的仪式。宠物不是皮肤，是"另一个TA"。
 *
 * 文件边界：src/app/[locale]/pet/**
 */

import { getTranslations, setRequestLocale } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing, type Locale } from '@/i18n/routing'
import type { Metadata } from 'next'
import PetDetailClient from './PetDetailClient'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    return {}
  }
  setRequestLocale(locale)
  try {
    const t = await getTranslations({ locale, namespace: 'pet' })
    return {
      title: t('title'),
      description: t('subtitle'),
    }
  } catch {
    return {
      title: 'My Pet',
      description: 'Summon your soul companion.',
    }
  }
}

export default async function PetPage({ params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)
  return <PetDetailClient />
}
