<template>
  <section id="howItWorks" class="how-it-works">
    <div class="how-container">
      <header class="how-header">
        <h2 class="title">{{ t('home.howItWorks') }}</h2>
        <p class="subtitle">{{ t('home.howItWorksDesc') }}</p>
      </header>

      <div class="workflow-stage">
        <img
          class="workflow-bolt"
          src="@/assets/images/home/lanhu/workflow-bolt.png"
          alt=""
          aria-hidden="true"
        />

        <div class="workflow-top">
          <article class="workflow-primary">
            <h3>{{ t('home.energyQuickRental') }}</h3>
            <p>{{ t('home.energyQuickRentalDesc') }}</p>
          </article>

          <ul class="workflow-points">
            <li>
              <SvgIcon name="how-right" width="18" height="18" />
              <span>{{ t('home.chooseTransactionCount') }}</span>
            </li>
            <li>
              <SvgIcon name="how-right" width="18" height="18" />
              <span>{{ t('home.transferToAddress') }}</span>
            </li>
            <li>
              <SvgIcon name="how-right" width="18" height="18" />
              <span>{{ t('home.systemAutoInject') }}</span>
            </li>
          </ul>
        </div>

        <div class="workflow-bottom">
          <div class="workflow-copy">
            <p>
              <SvgIcon name="how-right" width="16" height="16" />
              <span>{{ t('home.usdtToTrx') }}</span>
            </p>
            <p>
              <SvgIcon name="how-right" width="16" height="16" />
              <span>{{ t('home.trxToUsdt') }}</span>
            </p>
          </div>

          <div class="workflow-secondary-stack">
            <article class="workflow-secondary">
              <h3>{{ t('home.smartContractFlash') }}</h3>
            </article>
            <p class="workflow-secondary-detail">{{ t('home.smartContractFlashDesc') }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineOptions({
  name: 'HowItWorks',
})
</script>

<style lang="scss" scoped>
.how-it-works {
  position: relative;
  overflow: hidden;
  padding: 96px 0 120px;
  background:
    radial-gradient(ellipse 64% 54% at 92% 0%, rgba(210, 228, 255, 0.5) 0%, transparent 72%),
    #fff;
}

.how-container {
  width: min(100%, 1200px);
  margin: 0 auto;
  padding: 0 48px;
  box-sizing: border-box;
}

.how-header {
  text-align: center;
}

.title {
  margin: 0;
  color: #182230;
  font-size: 36px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 0.04em;
}

.subtitle {
  max-width: 780px;
  margin: 12px auto 0;
  color: #182230;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.7;
}

.workflow-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-top: 56px;
}

.workflow-bolt {
  position: absolute;
  z-index: 0;
  left: 30%;
  top: -48px;
  width: 410px;
  height: auto;
  aspect-ratio: 3 / 4;
  display: block;
  pointer-events: none;
  object-fit: contain;
  opacity: 0.86;
}

.workflow-top,
.workflow-bottom {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 440px minmax(0, 1fr);
  column-gap: 80px;
  align-items: center;
}

.workflow-bottom {
  align-items: start;
}

.workflow-primary {
  box-sizing: border-box;
  border-radius: 16px;
}

.workflow-secondary {
  box-sizing: border-box;
  border-radius: 8px;
}

.workflow-primary {
  min-height: 248px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 3%;
  padding: 48px 28px 48px 56px;
  color: #fff;
  background: #165dff;
  box-shadow: 0 18px 30px rgba(22, 93, 255, 0.1);
}

.workflow-primary h3,
.workflow-secondary h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.45;
}

.workflow-primary p {
  margin: 10px 0 0;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.7;
}

.workflow-points {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  width: min(100%, 400px);
  padding: 0;
  margin: 0 0 0 92px;
  list-style: none;
  justify-self: start;
}

.workflow-points li,
.workflow-copy p {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  color: #182230;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.65;
}

.workflow-points li {
  align-items: center;
}

.workflow-points svg {
  flex: 0 0 auto;
  color: #36c99b;
}

.workflow-copy {
  width: min(100%, 440px);
  padding: 36px 4px 0 126px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.workflow-copy span {
  max-width: 28em;
}

.workflow-copy svg {
  flex: 0 0 auto;
  margin-top: 3px;
  color: #4c8eff;
}

.workflow-secondary-stack {
  position: relative;
  width: min(100%, 420px);
  justify-self: end;
  margin-left: 0;
  margin-top: -40px;
  padding-top: 76px;
}

.workflow-secondary {
  position: absolute;
  top: 0;
  right: 10px;
  z-index: 2;
  width: 256px;
  min-height: 136px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 18% 16px 16px;
  color: #fff;
  text-align: center;
  background: #0b1733;
  box-shadow: 0 16px 28px rgba(10, 27, 69, 0.12);
}

.workflow-secondary-detail {
  box-sizing: border-box;
  min-height: 216px;
  margin: 0;
  padding: 108px 32px 28px;
  color: #182230;
  background: #f2f4f7;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.85;
}

@media (max-width: 1180px) and (min-width: 769px) {
  .how-container {
    padding: 0 32px;
  }

  .workflow-top,
  .workflow-bottom {
    grid-template-columns: minmax(300px, 1fr) minmax(0, 1fr);
    column-gap: 40px;
  }

  .workflow-bolt {
    left: 34%;
    width: 280px;
    height: auto;
    aspect-ratio: 3 / 4;
  }

  .workflow-primary {
    min-height: 220px;
    padding: 36px 28px;
  }

  .workflow-points,
  .workflow-secondary-stack {
    justify-self: stretch;
    width: 100%;
    margin-left: 0;
    margin-top: 0;
  }

  .workflow-copy {
    padding-top: 16px;
  }

  .workflow-copy span {
    max-width: none;
  }

  .workflow-secondary {
    width: 240px;
    min-height: 136px;
    right: 12px;
  }
}

@media (max-width: 768px) {
  .how-it-works {
    padding: 48px 0 52px;
  }

  .how-container {
    padding: 0 16px;
  }

  .title {
    font-size: 24px;
    letter-spacing: 0;
  }

  .subtitle {
    margin-top: 9px;
    font-size: 14px;
  }

  .workflow-stage {
    gap: 18px;
    margin-top: 28px;
  }

  .workflow-bolt {
    display: none;
  }

  .workflow-top,
  .workflow-bottom {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .workflow-primary,
  .workflow-secondary {
    width: 100%;
    min-height: 0;
    margin-left: 0;
    padding: 24px 20px;
  }

  .workflow-primary h3,
  .workflow-secondary h3 {
    font-size: 14px;
  }

  .workflow-points {
    width: 100%;
    margin-left: 0;
    gap: 12px;
  }

  .workflow-points li,
  .workflow-copy p {
    font-size: 12px;
  }

  .workflow-copy {
    width: 100%;
    padding: 0;
  }

  .workflow-copy span {
    max-width: none;
  }

  .workflow-secondary-stack {
    width: 100%;
    margin-left: 0;
    margin-top: 0;
    padding-top: 0;
  }

  .workflow-secondary {
    position: relative;
    top: auto;
    right: auto;
    width: 100%;
    min-height: 0;
    margin-bottom: 10px;
  }

  .workflow-secondary-detail {
    min-height: 0;
    padding: 20px;
    font-size: 14px;
  }
}
</style>
