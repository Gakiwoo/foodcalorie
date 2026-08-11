import React from 'react';

export default function FoodCalorieSearch() {
  return (
    <div
      data-node-id="12:19005"
      data-name="FoodCalorie-Search"
      style={{
        width: '375px',
        height: '812px',
        minHeight: '812px',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexDirection: 'column',
        background: '#F7F8FA',
        overflow: 'hidden'
      }}>
      <div
        data-node-id="12:19011"
        data-name="status-bar"
        style={{
          width: '375px',
          display: 'flex',
          flex: 'none',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '12px',
          paddingBottom: '8px',
          paddingRight: '20px',
          paddingLeft: '20px'
        }}>
        <span
          data-node-id="12:19013"
          data-name="status-time"
          style={{
            color: '#1A1A1A',
            fontSize: '15px',
            fontFamily: 'Inter',
            fontWeight: '600',
            lineHeight: '20px'
          }}>
          9:41
        </span>
        <div
          data-node-id="12:19042"
          data-name="status-icons"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '6px'
          }}>
          <img
            src="./asset/icons/svg_dafe2afa.svg"
            data-node-id="12:17372"
            data-name="icon-signal"
            style={{ width: '14px', height: '14px' }}
          />
          <img
            src="./asset/icons/svg_7d24f493.svg"
            data-node-id="12:17376"
            data-name="icon-wifi"
            style={{ width: '14px', height: '14px' }}
          />
          <img
            src="./asset/icons/svg_c23974ea.svg"
            data-node-id="12:17380"
            data-name="icon-battery"
            style={{ width: '14px', height: '14px' }}
          />
        </div>
      </div>
      <div
        data-node-id="12:19056"
        data-name="search-bar-section"
        style={{
          width: '375px',
          display: 'flex',
          flex: 'none',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '10px',
          paddingTop: '10px',
          paddingBottom: '10px',
          paddingRight: '20px',
          paddingLeft: '20px'
        }}>
        <img
          src="./asset/icons/svg_e5121903.svg"
          data-node-id="12:17384"
          data-name="nav-back"
          style={{ width: '22px', height: '22px' }}
        />
        <div
          data-node-id="12:19062"
          data-name="search-bar"
          style={{
            height: '40px',
            display: 'flex',
            flex: '1',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '8px',
            paddingRight: '14px',
            paddingLeft: '14px',
            background: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0px 2px 8px 0px rgba(0,0,0,0.04)'
          }}>
          <img
            src="./asset/icons/svg_f5941a49.svg"
            data-node-id="12:17388"
            data-name="search-icon"
            style={{ width: '14px', height: '14px' }}
          />
          <p
            data-node-id="12:19072"
            data-name="search-query"
            style={{
              flex: '1',
              flexShrink: '0',
              color: '#1A1A1A',
              fontSize: '14px',
              fontFamily: 'Inter',
              lineHeight: '20px'
            }}>
            鸡胸
          </p>
          <img
            src="./asset/icons/svg_de3aa75b.svg"
            data-node-id="12:17392"
            data-name="search-clear"
            style={{ width: '14px', height: '14px' }}
          />
        </div>
      </div>
      <div
        data-node-id="12:19117"
        data-name="filter-section"
        style={{
          width: '375px',
          display: 'flex',
          flex: 'none',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '8px',
          paddingTop: '4px',
          paddingBottom: '8px',
          paddingRight: '20px',
          paddingLeft: '20px'
        }}>
        <div
          data-node-id="12:19119"
          data-name="filter-all"
          style={{
            height: '30px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingRight: '14px',
            paddingLeft: '14px',
            background: '#34C759',
            borderRadius: '15px'
          }}>
          <span
            data-node-id="12:19123"
            data-name="filter-all-label"
            style={{
              color: '#FFFFFF',
              fontSize: '13px',
              fontFamily: 'Inter',
              textAlign: 'center',
              fontWeight: '600',
              lineHeight: '18px'
            }}>
            全部
          </span>
        </div>
        <div
          data-node-id="12:19160"
          data-name="filter-breakfast"
          style={{
            height: '30px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingRight: '14px',
            paddingLeft: '14px',
            background: '#FFFFFF',
            borderRadius: '15px',
            boxShadow: '0px 2px 8px 0px rgba(0,0,0,0.04)'
          }}>
          <span
            data-node-id="12:19166"
            data-name="filter-breakfast-label"
            style={{
              color: '#1A1A1A',
              fontSize: '13px',
              fontFamily: 'Inter',
              textAlign: 'center',
              fontWeight: '500',
              lineHeight: '18px'
            }}>
            早餐
          </span>
        </div>
        <div
          data-node-id="12:19203"
          data-name="filter-lunch"
          style={{
            height: '30px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingRight: '14px',
            paddingLeft: '14px',
            background: '#FFFFFF',
            borderRadius: '15px',
            boxShadow: '0px 2px 8px 0px rgba(0,0,0,0.04)'
          }}>
          <span
            data-node-id="12:19209"
            data-name="filter-lunch-label"
            style={{
              color: '#1A1A1A',
              fontSize: '13px',
              fontFamily: 'Inter',
              textAlign: 'center',
              fontWeight: '500',
              lineHeight: '18px'
            }}>
            午餐
          </span>
        </div>
        <div
          data-node-id="12:19246"
          data-name="filter-dinner"
          style={{
            height: '30px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingRight: '14px',
            paddingLeft: '14px',
            background: '#FFFFFF',
            borderRadius: '15px',
            boxShadow: '0px 2px 8px 0px rgba(0,0,0,0.04)'
          }}>
          <span
            data-node-id="12:19252"
            data-name="filter-dinner-label"
            style={{
              color: '#1A1A1A',
              fontSize: '13px',
              fontFamily: 'Inter',
              textAlign: 'center',
              fontWeight: '500',
              lineHeight: '18px'
            }}>
            晚餐
          </span>
        </div>
        <div
          data-node-id="12:19289"
          data-name="filter-snack"
          style={{
            height: '30px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingRight: '14px',
            paddingLeft: '14px',
            background: '#FFFFFF',
            borderRadius: '15px',
            boxShadow: '0px 2px 8px 0px rgba(0,0,0,0.04)'
          }}>
          <span
            data-node-id="12:19295"
            data-name="filter-snack-label"
            style={{
              color: '#1A1A1A',
              fontSize: '13px',
              fontFamily: 'Inter',
              textAlign: 'center',
              fontWeight: '500',
              lineHeight: '18px'
            }}>
            加餐
          </span>
        </div>
      </div>
      <div
        data-node-id="12:19332"
        data-name="result-count-section"
        style={{
          width: '375px',
          display: 'flex',
          flex: 'none',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '4px',
          paddingBottom: '8px',
          paddingRight: '20px',
          paddingLeft: '20px'
        }}>
        <span
          data-node-id="12:19334"
          data-name="result-count"
          style={{
            color: '#9CA3AF',
            fontSize: '13px',
            fontFamily: 'Inter',
            fontWeight: '500',
            lineHeight: '18px'
          }}>
          找到 8 条结果
        </span>
        <div
          data-node-id="12:19379"
          data-name="sort-btn"
          style={{
            height: '24px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '4px',
            paddingRight: '8px',
            paddingLeft: '8px',
            background: '#FFFFFF',
            borderRadius: '12px'
          }}>
          <span
            data-node-id="12:19383"
            data-name="sort-btn-text"
            style={{
              color: '#1A1A1A',
              fontSize: '12px',
              fontFamily: 'Inter',
              textAlign: 'center',
              fontWeight: '500',
              lineHeight: '16px'
            }}>
            热量从低到高
          </span>
          <img
            src="./asset/icons/svg_0b791b16.svg"
            data-node-id="12:17396"
            data-name="sort-btn-icon"
            style={{ width: '10px', height: '10px' }}
          />
        </div>
      </div>
      <div
        data-node-id="12:19424"
        data-name="result-list"
        style={{
          width: '375px',
          display: 'flex',
          flex: 'none',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          flexDirection: 'column',
          gap: '10px',
          paddingTop: '4px',
          paddingBottom: '16px',
          paddingRight: '20px',
          paddingLeft: '20px'
        }}>
        <div
          data-node-id="12:19426"
          data-name="result-1"
          style={{
            width: '335px',
            display: 'flex',
            flex: 'none',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)'
          }}>
          <div
            data-node-id="12:19432"
            data-name="result-1-thumb"
            style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              flex: 'none',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #C8E6C9 0%, #A5D6A7 100%)',
              borderRadius: '12px'
            }}>
            <img
              src="./asset/icons/svg_a1f75eb3.svg"
              data-node-id="12:17400"
              data-name="result-1-icon"
              style={{ width: '20px', height: '20px' }}
            />
          </div>
          <div
            data-node-id="12:19440"
            data-name="result-1-info"
            style={{
              display: 'flex',
              flex: '1',
              justifyContent: 'center',
              alignItems: 'flex-start',
              flexDirection: 'column',
              gap: '4px'
            }}>
            <span
              data-node-id="12:19442"
              data-name="result-1-name"
              style={{
                flexShrink: '0',
                color: '#1A1A1A',
                fontSize: '15px',
                fontFamily: 'Inter',
                fontWeight: '600',
                lineHeight: '20px'
              }}>
              香煎鸡胸肉
            </span>
            <span
              data-node-id="12:19476"
              data-name="result-1-cal"
              style={{
                flexShrink: '0',
                color: '#9CA3AF',
                fontSize: '12px',
                fontFamily: 'Inter',
                lineHeight: '16px'
              }}>
              100g · 165 kcal · 蛋白质 31g
            </span>
          </div>
          <div
            data-node-id="12:19513"
            data-name="result-1-add"
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              flex: 'none',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#E8F5EC',
              borderRadius: '16px'
            }}>
            <img
              src="./asset/icons/svg_e5fdd5ea.svg"
              data-node-id="12:17404"
              data-name="result-1-add-icon"
              style={{ width: '14px', height: '14px' }}
            />
          </div>
        </div>
        <div
          data-node-id="12:19521"
          data-name="result-2"
          style={{
            width: '335px',
            display: 'flex',
            flex: 'none',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)'
          }}>
          <div
            data-node-id="12:19527"
            data-name="result-2-thumb"
            style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              flex: 'none',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%)',
              borderRadius: '12px'
            }}>
            <img
              src="./asset/icons/svg_a893487a.svg"
              data-node-id="12:17408"
              data-name="result-2-icon"
              style={{ width: '20px', height: '20px' }}
            />
          </div>
          <div
            data-node-id="12:19535"
            data-name="result-2-info"
            style={{
              display: 'flex',
              flex: '1',
              justifyContent: 'center',
              alignItems: 'flex-start',
              flexDirection: 'column',
              gap: '4px'
            }}>
            <span
              data-node-id="12:19537"
              data-name="result-2-name"
              style={{
                flexShrink: '0',
                color: '#1A1A1A',
                fontSize: '15px',
                fontFamily: 'Inter',
                fontWeight: '600',
                lineHeight: '20px'
              }}>
              宫保鸡丁
            </span>
            <span
              data-node-id="12:19571"
              data-name="result-2-cal"
              style={{
                flexShrink: '0',
                color: '#9CA3AF',
                fontSize: '12px',
                fontFamily: 'Inter',
                lineHeight: '16px'
              }}>
              1 份 · 320 kcal · 蛋白质 24g
            </span>
          </div>
          <div
            data-node-id="12:19613"
            data-name="result-2-add"
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              flex: 'none',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#E8F5EC',
              borderRadius: '16px'
            }}>
            <img
              src="./asset/icons/svg_e5fdd5ea.svg"
              data-node-id="12:17412"
              data-name="result-2-add-icon"
              style={{ width: '14px', height: '14px' }}
            />
          </div>
        </div>
        <div
          data-node-id="12:19621"
          data-name="result-3"
          style={{
            width: '335px',
            display: 'flex',
            flex: 'none',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)'
          }}>
          <div
            data-node-id="12:19627"
            data-name="result-3-thumb"
            style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              flex: 'none',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #C8E6C9 0%, #A5D6A7 100%)',
              borderRadius: '12px'
            }}>
            <img
              src="./asset/icons/svg_a1f75eb3.svg"
              data-node-id="12:17416"
              data-name="result-3-icon"
              style={{ width: '20px', height: '20px' }}
            />
          </div>
          <div
            data-node-id="12:19635"
            data-name="result-3-info"
            style={{
              display: 'flex',
              flex: '1',
              justifyContent: 'center',
              alignItems: 'flex-start',
              flexDirection: 'column',
              gap: '4px'
            }}>
            <span
              data-node-id="12:19637"
              data-name="result-3-name"
              style={{
                flexShrink: '0',
                color: '#1A1A1A',
                fontSize: '15px',
                fontFamily: 'Inter',
                fontWeight: '600',
                lineHeight: '20px'
              }}>
              鸡胸肉沙拉
            </span>
            <span
              data-node-id="12:19671"
              data-name="result-3-cal"
              style={{
                flexShrink: '0',
                color: '#9CA3AF',
                fontSize: '12px',
                fontFamily: 'Inter',
                lineHeight: '16px'
              }}>
              1 份 · 210 kcal · 蛋白质 28g
            </span>
          </div>
          <div
            data-node-id="12:19713"
            data-name="result-3-add"
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              flex: 'none',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#E8F5EC',
              borderRadius: '16px'
            }}>
            <img
              src="./asset/icons/svg_e5fdd5ea.svg"
              data-node-id="12:17420"
              data-name="result-3-add-icon"
              style={{ width: '14px', height: '14px' }}
            />
          </div>
        </div>
        <div
          data-node-id="12:19721"
          data-name="result-4"
          style={{
            width: '335px',
            display: 'flex',
            flex: 'none',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)'
          }}>
          <div
            data-node-id="12:19727"
            data-name="result-4-thumb"
            style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              flex: 'none',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%)',
              borderRadius: '12px'
            }}>
            <img
              src="./asset/icons/svg_c6efea1d.svg"
              data-node-id="12:17424"
              data-name="result-4-icon"
              style={{ width: '20px', height: '20px' }}
            />
          </div>
          <div
            data-node-id="12:19735"
            data-name="result-4-info"
            style={{
              display: 'flex',
              flex: '1',
              justifyContent: 'center',
              alignItems: 'flex-start',
              flexDirection: 'column',
              gap: '4px'
            }}>
            <span
              data-node-id="12:19737"
              data-name="result-4-name"
              style={{
                flexShrink: '0',
                color: '#1A1A1A',
                fontSize: '15px',
                fontFamily: 'Inter',
                fontWeight: '600',
                lineHeight: '20px'
              }}>
              香菇鸡肉焖饭
            </span>
            <span
              data-node-id="12:19771"
              data-name="result-4-cal"
              style={{
                flexShrink: '0',
                color: '#9CA3AF',
                fontSize: '12px',
                fontFamily: 'Inter',
                lineHeight: '16px'
              }}>
              1 份 · 520 kcal · 蛋白质 28g
            </span>
          </div>
          <div
            data-node-id="12:19813"
            data-name="result-4-add"
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              flex: 'none',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#E8F5EC',
              borderRadius: '16px'
            }}>
            <img
              src="./asset/icons/svg_e5fdd5ea.svg"
              data-node-id="12:17428"
              data-name="result-4-add-icon"
              style={{ width: '14px', height: '14px' }}
            />
          </div>
        </div>
        <div
          data-node-id="12:19821"
          data-name="result-5"
          style={{
            width: '335px',
            display: 'flex',
            flex: 'none',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)'
          }}>
          <div
            data-node-id="12:19827"
            data-name="result-5-thumb"
            style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              flex: 'none',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
              borderRadius: '12px'
            }}>
            <img
              src="./asset/icons/svg_435d0625.svg"
              data-node-id="12:17432"
              data-name="result-5-icon"
              style={{ width: '20px', height: '20px' }}
            />
          </div>
          <div
            data-node-id="12:19837"
            data-name="result-5-info"
            style={{
              display: 'flex',
              flex: '1',
              justifyContent: 'center',
              alignItems: 'flex-start',
              flexDirection: 'column',
              gap: '4px'
            }}>
            <span
              data-node-id="12:19839"
              data-name="result-5-name"
              style={{
                flexShrink: '0',
                color: '#1A1A1A',
                fontSize: '15px',
                fontFamily: 'Inter',
                fontWeight: '600',
                lineHeight: '20px'
              }}>
              鸡胸西兰花
            </span>
            <span
              data-node-id="12:19873"
              data-name="result-5-cal"
              style={{
                flexShrink: '0',
                color: '#9CA3AF',
                fontSize: '12px',
                fontFamily: 'Inter',
                lineHeight: '16px'
              }}>
              1 份 · 195 kcal · 蛋白质 26g
            </span>
          </div>
          <div
            data-node-id="12:19915"
            data-name="result-5-add"
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              flex: 'none',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#E8F5EC',
              borderRadius: '16px'
            }}>
            <img
              src="./asset/icons/svg_e5fdd5ea.svg"
              data-node-id="12:17436"
              data-name="result-5-add-icon"
              style={{ width: '14px', height: '14px' }}
            />
          </div>
        </div>
        <div
          data-node-id="12:19923"
          data-name="result-6"
          style={{
            width: '335px',
            display: 'flex',
            flex: 'none',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)'
          }}>
          <div
            data-node-id="12:19929"
            data-name="result-6-thumb"
            style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              flex: 'none',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%)',
              borderRadius: '12px'
            }}>
            <img
              src="./asset/icons/svg_c8ff2d2d.svg"
              data-node-id="12:17440"
              data-name="result-6-icon"
              style={{ width: '20px', height: '20px' }}
            />
          </div>
          <div
            data-node-id="12:19937"
            data-name="result-6-info"
            style={{
              display: 'flex',
              flex: '1',
              justifyContent: 'center',
              alignItems: 'flex-start',
              flexDirection: 'column',
              gap: '4px'
            }}>
            <span
              data-node-id="12:19939"
              data-name="result-6-name"
              style={{
                flexShrink: '0',
                color: '#1A1A1A',
                fontSize: '15px',
                fontFamily: 'Inter',
                fontWeight: '600',
                lineHeight: '20px'
              }}>
              黄焖鸡米饭
            </span>
            <span
              data-node-id="12:19973"
              data-name="result-6-cal"
              style={{
                flexShrink: '0',
                color: '#9CA3AF',
                fontSize: '12px',
                fontFamily: 'Inter',
                lineHeight: '16px'
              }}>
              1 份 · 680 kcal · 蛋白质 35g
            </span>
          </div>
          <div
            data-node-id="12:20015"
            data-name="result-6-add"
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              flex: 'none',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#E8F5EC',
              borderRadius: '16px'
            }}>
            <img
              src="./asset/icons/svg_e5fdd5ea.svg"
              data-node-id="12:17444"
              data-name="result-6-add-icon"
              style={{ width: '14px', height: '14px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
