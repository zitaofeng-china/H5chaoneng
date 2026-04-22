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
                  <div class="text">{{ $t('fee.feeInfo') }}</div>
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
  padding: 100px 0;
  background: var(--theme-bg-light);
}

.fee-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.fee-header {
  text-align: center;
  margin-bottom: 50px;
}

.fee-title {
  font-size: 40px;
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
  background: var(--theme-text-white);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0px 13px 22px 0px rgba(0, 0, 0, 0.07);
}

.fee-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.fee-column {
  padding: 30px;

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
  font-size: 20px;
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
  font-size: 14px;

  &:last-child {
    padding-top: 10px;
  }

  &.fee-item-bg {
    margin-top: 10px;
    padding: 10px;
    border-radius: 5px;
    background: rgba(22, 93, 255, 0.1);
    color: var(--theme-bg-blue);

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
  background: var(--theme-transfer-bg-light);
  padding: 30px;
}

.notice-header {
  margin-bottom: 10px;
}

.notice-title {
  font-size: 14px;
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
  font-size: 14px;
  // line-height: 1;
}

.notice-text {
  flex: 1;
  color: var(--theme-text-muted);
}

@media (max-width: 768px) {
  .fee-container {
    max-width: initial;
    padding: 0 10px;
  }

  .fee-description {
    padding: 40px 0;
  }

  .fee-header {
    margin-bottom: 20px;
  }

  .fee-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .fee-subtitle {
    font-size: 13px;
    line-height: 1.5;
  }

  .fee-content {
    border-radius: 12px;
  }

  .fee-columns {
    grid-template-columns: 1fr;

    &:not(:last-child) {
      border: none;
    }

    .fee-column {
      position: relative;
      padding: 20px 18px;

      &:not(:last-child) {
        &::after {
          display: block;
          content: '';
          position: absolute;
          bottom: 0;
          left: 18px;
          right: 18px;
          border-top: 1px solid rgba(245, 245, 245, 1);
        }
      }
    }
  }

  .column-title {
    font-size: 16px;
    font-weight: 600;

    svg {
      width: 20px;
      height: 20px;
      margin-right: 8px;
    }
  }

  .fee-item {
    font-size: 13px;

    .fee-label {
      font-size: 13px;
    }

    .fee-value {
      font-size: 13px;
    }

    .fee-info {
      .text {
        font-size: 11px;
        line-height: 18px;
      }

      svg {
        width: 11px;
        height: 11px;
      }
    }

    &.fee-item-bg {
      padding: 8px;

      .fee-info .text {
        font-size: 12px;
      }
    }
  }

  .important-notice {
    padding: 20px 18px;
  }

  .notice-title {
    font-size: 13px;
  }

  .notice-item {
    font-size: 13px;
    gap: 6px;

    svg {
      width: 11px;
      height: 11px;
      flex-shrink: 0;
    }
  }

  .notice-text {
    font-size: 12px;
    line-height: 1.5;
  }
}
</style>
