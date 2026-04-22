<template>
  <div id="question" class="faq-section">
    <div class="faq-container">
      <div class="faq-header">
        <div class="faq-title">{{ $t('faq.title') }}</div>
        <div class="faq-subtitle">{{ $t('faq.subtitle') }}</div>
      </div>

      <div class="faq-list">
        <div
          v-for="(item, index) in faqItems"
          :key="index"
          class="faq-item"
          :class="{ active: activeIndex === index }"
          @click.stop="toggleItem(index)"
        >
          <div class="faq-question">
            <span>{{ $t(item.questionKey) }}</span>
            <div class="faq-icon">
              <SvgIcon name="faq-arrow" width="24" height="24" />
            </div>
          </div>
          <div class="faq-answer" v-show="activeIndex === index" @click.stop="() => {}">
            <template v-if="item.questionKey === 'faq.problemsSupport'">
              {{ formatAnswerWithTgAdmin($t(item.answerKey)) }}
            </template>
            <template v-else>
              {{ $t(item.answerKey) }}
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
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

const faqItems = ref<FaqItem[]>([
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
])

const toggleItem = (index: number) => {
  activeIndex.value = activeIndex.value === index ? -1 : index
}

/**
 * 格式化答案，将 @GasVipBot 替换为实际的 tg_admin
 */
const formatAnswerWithTgAdmin = (answer: string) => {
  const tgAdmin = siteStore.tgAdmin || '@GasVipBot'
  return answer.replace(/@GasVipBot/g, tgAdmin)
}
</script>

<style lang="scss" scoped>
.faq-section {
  padding: 100px 0;
  background: var(--theme-bg-white);
}

.faq-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 40px;
}

.faq-header {
  text-align: center;
  margin-bottom: 60px;
}

.faq-title {
  font-size: 40px;
  font-weight: 700;
  color: var(--theme-text-black);
  margin-bottom: 10px;
}

.faq-subtitle {
  font-size: 14px;
  color: var(--theme-text-black);
  opacity: 0.8;
  line-height: 1.6;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.faq-item {
  background: var(--theme-text-white);
  border: 1px solid rgba(30, 41, 59, 0.2);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  &.active {
    .faq-icon {
      transform: rotate(180deg);
    }
  }
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  font-size: 18px;
  font-weight: 600;
  transition: color 0.3s ease;
}

.faq-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--theme-text-black);
  transition: all 0.3s ease;

  svg {
    transition: transform 0.3s ease;
  }
}

.faq-answer {
  padding: 10px 32px 24px;
  font-size: 16px;
  opacity: 0.8;
  line-height: 1.8;
  white-space: pre-line;
  border-top: 1px solid rgba(30, 41, 59, 0.2);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 0.8;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .faq-container {
    max-width: initial;
    padding: 0 10px;
  }

  .faq-section {
    padding: 40px 0;
  }

  .faq-header {
    margin-bottom: 20px;
  }

  .faq-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .faq-subtitle {
    font-size: 13px;
    line-height: 1.5;
  }

  .faq-list {
    gap: 12px;
  }

  .faq-item {
    border-radius: 10px;
  }

  .faq-question {
    padding: 16px 18px;
    font-size: 14px;
    font-weight: 600;
    gap: 12px;
  }

  .faq-icon {
    svg {
      width: 20px;
      height: 20px;
    }
  }

  .faq-answer {
    padding: 8px 18px 16px;
    font-size: 13px;
    line-height: 1.6;
  }
}
</style>
