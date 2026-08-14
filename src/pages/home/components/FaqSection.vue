<template>
  <section id="question" class="faq-section">
    <div class="faq-container">
      <header class="faq-header">
        <h2 class="faq-title">{{ $t('faq.title') }}</h2>
        <p class="faq-subtitle">{{ $t('faq.subtitle') }}</p>
      </header>

      <div class="faq-list">
        <article
          v-for="(item, index) in faqItems"
          :key="item.questionKey"
          class="faq-item"
          :class="{ active: activeIndex === index }"
        >
          <button type="button" class="faq-question" @click.stop="toggleItem(index)">
            <span>{{ $t(item.questionKey) }}</span>
            <SvgIcon name="faq-arrow" width="18" height="18" />
          </button>
          <div v-show="activeIndex === index" class="faq-answer">
            <template v-if="item.questionKey === 'faq.problemsSupport'">
              {{ formatAnswerWithTgAdmin($t(item.answerKey)) }}
            </template>
            <template v-else>
              {{ $t(item.answerKey) }}
            </template>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSiteStore } from '@/stores/useSiteStore'

defineOptions({
  name: 'FaqSection',
})

const siteStore = useSiteStore()
const activeIndex = ref(0)

type FaqItem = {
  questionKey: string
  answerKey: string
}

const faqItems: FaqItem[] = [
  {
    questionKey: 'faq.whatIsEnergyRental',
    answerKey: 'faq.whatIsEnergyRentalAns',
  },
  {
    questionKey: 'faq.howToUseRental',
    answerKey: 'faq.howToUseRentalAns',
  },
  {
    questionKey: 'faq.rentalValidity',
    answerKey: 'faq.rentalValidityAns',
  },
  {
    questionKey: 'faq.feeCalculation',
    answerKey: 'faq.feeCalculationAns',
  },
  {
    questionKey: 'faq.problemsSupport',
    answerKey: 'faq.problemsSupportAns',
  },
]

const toggleItem = (index: number) => {
  activeIndex.value = activeIndex.value === index ? -1 : index
}

const formatAnswerWithTgAdmin = (answer: string) => {
  const tgAdmin = siteStore.tgAdmin || '@GasVipBot'
  return answer.replace(/@GasVipBot/g, tgAdmin)
}
</script>

<style lang="scss" scoped>
.faq-section {
  padding: 64px 0 72px;
  background: #f7f9fd;
}

.faq-container {
  width: min(100%, 820px);
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
}

.faq-header {
  margin-bottom: 34px;
  text-align: center;
}

.faq-title {
  margin: 0;
  color: #182230;
  font-size: 36px;
  font-weight: 700;
  line-height: 1.3;
}

.faq-subtitle {
  margin: 11px auto 0;
  color: rgba(71, 84, 103, 0.72);
  font-size: 13px;
  line-height: 1.6;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.faq-item {
  overflow: hidden;
  border: 1px solid #dce3ed;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(30, 41, 59, 0.03);
}

.faq-question {
  width: 100%;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 20px;
  border: 0;
  color: #253246;
  background: #fff;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
  text-align: left;
  cursor: pointer;

  &:hover {
    color: #165dff;
  }

  svg {
    flex: 0 0 auto;
    color: #7f8da3;
    transition: transform 0.2s ease;
  }
}

.faq-item.active .faq-question svg {
  color: #165dff;
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 18px 15px;
  color: rgba(71, 84, 103, 0.74);
  font-size: 12px;
  line-height: 1.75;
  white-space: pre-line;
}

@media (max-width: 768px) {
  .faq-section {
    padding: 48px 0 52px;
  }

  .faq-container {
    padding: 0 14px;
  }

  .faq-header {
    margin-bottom: 20px;
  }

  .faq-title {
    font-size: 24px;
  }

  .faq-subtitle {
    margin-top: 8px;
    font-size: 12px;
  }

  .faq-list {
    gap: 6px;
  }

  .faq-question {
    min-height: 44px;
    padding: 10px 13px;
    font-size: 12px;
  }

  .faq-question svg {
    width: 16px;
    height: 16px;
  }

  .faq-answer {
    padding: 0 13px 12px;
    font-size: 11px;
    line-height: 1.65;
  }
}
</style>
