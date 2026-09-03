<template>
  <div id="fee" class="fee-description">
    <div class="fee-container">
      <div class="fee-header">
        <div class="fee-title">{{ $t('fee.title') }}</div>
        <div class="fee-subtitle">{{ $t('fee.subtitle') }}</div>
      </div>

      <div class="fee-content">
        <div class="fee-columns">
          <div class="fee-column">
            <div class="column-header">
              <div class="column-title">
                <SvgIcon name="fee-arrow" width="24" height="24" />
                <span>{{ $t('fee.usdtToTrxFee') }}</span>
              </div>
            </div>
            <div class="fee-list">
              <div class="fee-item">
                <div class="fee-label">{{ $t('fee.platformFee') }}</div>
                <div class="fee-value">{{ $t('fee.platformFeeValue') }}</div>
              </div>
              <div class="fee-item">
                <div class="fee-label">{{ $t('fee.contractFee') }}</div>
                <div class="fee-value">{{ $t('fee.contractFeeValue') }}</div>
              </div>
              <div class="fee-item">
                <div class="fee-label">{{ $t('fee.trxBandwidthFee') }}</div>
                <div class="fee-value">{{ $t('fee.contractFeeValue') }}</div>
              </div>
              <div class="fee-item">
                <div class="fee-info">
                  <SvgIcon name="fee-info" width="12" height="12" />
                  <div class="text">
                    <span class="fee-info-desktop">{{ $t('fee.feeInfo') }}</span>
                    <span class="fee-info-mobile">{{ $t('fee.feeInfoMobile') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="fee-column">
            <div class="column-header">
              <div class="column-title">
                <SvgIcon name="fee-arrow" width="24" height="24" />
                <span>{{ $t('fee.trxToUsdtFee') }}</span>
              </div>
            </div>
            <div class="fee-list">
              <div class="fee-item">
                <div class="fee-label">{{ $t('fee.platformFee') }}</div>
                <div class="fee-value">{{ $t('fee.platformFeeValue') }}</div>
              </div>
              <div class="fee-item">
                <div class="fee-label">{{ $t('fee.contractFee') }}</div>
                <div class="fee-value">{{ $t('fee.contractFeeValue') }}</div>
              </div>
              <div class="fee-item">
                <div class="fee-label">{{ $t('fee.usdtBandwidthFee') }}</div>
                <div class="fee-value">{{ $t('fee.contractFeeValue') }}</div>
              </div>
              <div class="fee-item fee-item-bg">
                <div class="fee-info">
                  <SvgIcon name="fee-info" width="12" height="12" />
                  <div class="text">
                    {{ $t('fee.usdtNote') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="important-notice">
          <div class="notice-header">
            <div class="notice-title">{{ $t('fee.importantNotice') }}</div>
          </div>
          <div class="notice-list">
            <div class="notice-item">
              <SvgIcon name="fee-right" width="12" height="12" />
              <div class="notice-text">
                {{ $t('fee.slippageNote') }}
              </div>
            </div>
            <div class="notice-item">
              <SvgIcon name="fee-right" width="12" height="12" />
              <div class="notice-text">
                {{ $t('fee.minAmount') }}
              </div>
            </div>
            <div class="notice-item">
              <SvgIcon name="fee-right" width="12" height="12" />
              <div class="notice-text">{{ $t('fee.transparentNote') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'FeeDescription',
})
</script>

<style lang="scss" scoped>
.fee-description {
  position: relative;
  padding: 64px 0 56px;
  /* 背景改由父级 .fee-workflow-ambient 统一绘制的环境光渐变提供，
     避免与“工作原理”区块的背景在拼接处出现断层空白。 */
  background: transparent;
}

.fee-container {
  max-width: 920px;
  margin: 0 auto;
  padding: 0 20px;
}

.fee-header {
  text-align: center;
  margin-bottom: 44px;
}

.fee-title {
  font-size: 34px;
  font-weight: 700;
  color: var(--theme-text-black);
  margin-bottom: 10px;
}

.fee-subtitle {
  font-size: 14px;
  color: var(--theme-text-black);
  opacity: 0.8;
  line-height: 1.6;
}

.fee-content {
  display: flex;
  flex-direction: column;
  background: var(--theme-bg-white, #ffffff);
  border: 1px solid var(--theme-card-border, rgba(226, 232, 240, 0.9));
  border-radius: var(--theme-radius-lg, 8px);
  overflow: hidden;
  box-shadow: var(--theme-shadow-md, 0 4px 14px -2px rgba(15, 23, 42, 0.06));
}

.fee-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.fee-column {
  padding: 28px 32px 24px;

  &:not(:last-child) {
    border-right: 1px solid rgba(245, 245, 245, 1);
  }
}

.column-header {
  padding-bottom: 10px;
}

.column-title {
  display: flex;
  align-items: center;
  font-size: 17px;
  font-weight: 700;
  color: var(--theme-text-black);

  svg {
    margin-right: 10px;
  }
}

.fee-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.fee-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 5px 0 0 0;
  font-size: 12px;

  &:last-child {
    padding-top: 10px;
  }

  &.fee-item-bg {
    margin-top: 10px;
    padding: 10px;
    border-radius: var(--theme-radius-sm, 4px);
    background: rgba(22, 93, 255, 0.08);
    color: var(--theme-primary-blue, #165dff);

    .fee-info {
      color: var(--theme-bg-blue);
      opacity: 1;

      .text {
        font-size: 14px;
      }
    }
  }

  .fee-info {
    color: var(--theme-text-black);
    opacity: 0.6;
    display: flex;

    .text {
      font-size: 12px;
      flex: 1;
      margin-left: 5px;
      line-height: 20px;
    }

    .fee-info-mobile {
      display: none;
    }

    svg {
      padding-top: 5px;
    }
  }

  .fee-label {
    color: var(--theme-text-black);
    opacity: 0.8;
    margin-right: 16px;
  }

  .fee-value {
    color: var(--theme-text-black);
    font-weight: 500;
    text-align: right;
    flex-shrink: 0;
    max-width: 55%;
    line-height: 1.5;
  }
}

.important-notice {
  background: #f7f9fd;
  padding: 24px 32px 26px;
}

.notice-header {
  margin-bottom: 10px;
}

.notice-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--theme-text-black);
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notice-item {
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  // line-height: 1;
}

.notice-text {
  flex: 1;
  color: var(--theme-text-muted);
}

@media (max-width: 890px) {
  .fee-container {
    max-width: initial;
    margin: 0;
    padding: 0 16px;
  }

  .fee-description {
    padding: 28px 0 24px;
  }

  .fee-header {
    margin-bottom: 18px;
  }

  .fee-title {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 8px;
    letter-spacing: 0.02em;
  }

  .fee-subtitle {
    font-size: 12px;
    line-height: 1.5;
    color: #98a2b3;
    opacity: 1;
    padding: 0 8px;
  }

  .fee-content {
    border-radius: 16px;
    box-shadow: 0 8px 28px rgba(21, 47, 92, 0.06);
  }

  .fee-columns {
    grid-template-columns: 1fr;

    .fee-column {
      position: relative;
      padding: 20px 20px 8px;

      &:not(:last-child) {
        padding-bottom: 12px;

        &::after {
          display: none;
        }
      }

      &:last-child {
        padding-top: 12px;
        padding-bottom: 8px;
      }
    }
  }

  .column-header {
    padding-bottom: 14px;
  }

  .column-title {
    color: var(--theme-text-blue);
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.01em;

    svg {
      width: 20px;
      height: 20px;
      margin-right: 8px;
    }
  }

  .fee-list {
    gap: 12px;
  }

  .fee-item {
    padding: 0;
    font-size: 13px;
    line-height: 1.5;

    &:last-child {
      padding-top: 4px;
    }

    .fee-label {
      font-size: 13px;
      opacity: 0.7;
      margin-right: 12px;
    }

    .fee-value {
      font-size: 13px;
      font-weight: 600;
    }

    .fee-info {
      opacity: 0.55;

      .fee-info-desktop {
        display: none;
      }

      .fee-info-mobile {
        display: inline;
      }

      .text {
        font-size: 12px;
        line-height: 20px;
      }

      svg {
        width: 12px;
        height: 12px;
        padding-top: 4px;
        flex-shrink: 0;
      }
    }

    &.fee-item-bg {
      margin-top: 8px;
      padding: 12px 14px;
      border-radius: 10px;
      background: #e8efff;

      .fee-info {
        opacity: 1;
        color: var(--theme-bg-blue);

        .text {
          font-size: 13px;
          line-height: 1.6;
        }

        svg {
          padding-top: 3px;
        }
      }
    }
  }

  .important-notice {
    background: transparent;
    padding: 12px 20px 22px;
  }

  .notice-header {
    margin-bottom: 12px;
  }

  .notice-title {
    font-size: 15px;
    font-weight: 700;
  }

  .notice-list {
    gap: 12px;
  }

  .notice-item {
    margin-top: 0;
    align-items: flex-start;
    font-size: 13px;
    gap: 8px;

    svg {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      margin-top: 2px;
    }
  }

  .notice-text {
    font-size: 13px;
    line-height: 1.55;
    color: #667085;
  }
}
</style>
