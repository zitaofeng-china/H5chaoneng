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
/**
 * 以 1200px 设计稿为基准整体等比缩放。
 * --u 表示「设计稿里的 1px」实际渲染多长：
 *   宽度 >= 1200px 时恒为 1px（还原设计稿）
 *   宽度 <  1200px 时随容器宽度线性缩小，版式比例与大屏完全一致
 * 因此 769px ~ 1200px 之间不再需要单独的中间态断点，
 * 只在 768px 及以下切换为移动端堆叠布局（与全站断点保持一致）。
 */
@function u($n) {
  @return calc(#{$n} * var(--u));
}

.how-it-works {
  container-type: inline-size;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse 64% 54% at 92% 0%, rgba(210, 228, 255, 0.5) 0%, transparent 72%),
    #fff;
}

.how-container {
  /* 兜底：不支持容器查询单位时退化为视口宽度 */
  --u: calc(min(100vw, 1200px) / 1200);

  width: min(100%, 1200px);
  margin: 0 auto;
  padding: u(96) u(48) u(120);
  box-sizing: border-box;
}

@supports (width: 1cqw) {
  .how-container {
    --u: calc(min(100cqw, 1200px) / 1200);
  }
}

.how-header {
  text-align: center;
}

.title {
  margin: 0;
  color: #182230;
  font-size: u(36);
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 0.04em;
}

.subtitle {
  max-width: u(780);
  margin: u(12) auto 0;
  color: #182230;
  font-size: u(14);
  font-weight: 700;
  line-height: 1.7;
}

.workflow-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: u(32);
  margin-top: u(56);
}

.workflow-bolt {
  position: absolute;
  z-index: 0;
  left: 30%;
  top: u(-48);
  width: u(410);
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
  grid-template-columns: u(440) minmax(0, 1fr);
  column-gap: u(80);
  align-items: center;
}

.workflow-bottom {
  align-items: start;
}

.workflow-primary {
  box-sizing: border-box;
  border-radius: u(16);
}

.workflow-secondary {
  box-sizing: border-box;
  border-radius: u(8);
}

.workflow-primary {
  min-height: u(248);
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 3%;
  padding: u(48) u(28) u(48) u(56);
  color: #fff;
  background: #165dff;
  box-shadow: 0 u(18) u(30) rgba(22, 93, 255, 0.1);
}

.workflow-primary h3,
.workflow-secondary h3 {
  margin: 0;
  font-size: u(14);
  font-weight: 700;
  line-height: 1.45;
}

.workflow-primary p {
  margin: u(10) 0 0;
  color: #fff;
  font-size: u(14);
  font-weight: 700;
  line-height: 1.7;
}

.workflow-points {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: u(20);
  width: min(100%, u(400));
  padding: 0;
  margin: 0 0 0 u(92);
  list-style: none;
  justify-self: start;
}

.workflow-points li,
.workflow-copy p {
  display: flex;
  align-items: flex-start;
  gap: u(8);
  margin: 0;
  color: #182230;
  font-size: u(12);
  font-weight: 700;
  line-height: 1.65;
}

.workflow-points li {
  align-items: center;
}

.workflow-points svg {
  flex: 0 0 auto;
  width: u(18);
  height: u(18);
  color: #36c99b;
}

.workflow-copy {
  width: min(100%, u(440));
  padding: u(36) u(4) 0 u(126);
  display: flex;
  flex-direction: column;
  gap: u(18);
}

.workflow-copy span {
  max-width: 28em;
}

.workflow-copy svg {
  flex: 0 0 auto;
  width: u(16);
  height: u(16);
  margin-top: u(3);
  color: #4c8eff;
}

.workflow-secondary-stack {
  position: relative;
  width: min(100%, u(420));
  justify-self: end;
  margin-left: 0;
  margin-top: u(-40);
  padding-top: u(76);
}

.workflow-secondary {
  position: absolute;
  top: 0;
  right: u(10);
  z-index: 2;
  width: u(256);
  min-height: u(136);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 18% u(16) u(16);
  color: #fff;
  text-align: center;
  background: #0b1733;
  box-shadow: 0 u(16) u(28) rgba(10, 27, 69, 0.12);
}

.workflow-secondary-detail {
  box-sizing: border-box;
  min-height: u(216);
  margin: 0;
  padding: u(108) u(32) u(28);
  color: #182230;
  background: #f2f4f7;
  border-radius: u(8);
  font-size: u(14);
  font-weight: 700;
  line-height: 1.85;
}

@media (max-width: 768px) {
  .how-container {
    /* 移动端不再等比缩放，回到 1:1 的移动端设计值 */
    --u: 1px;

    padding: 48px 16px 52px;
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
