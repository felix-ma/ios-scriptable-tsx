/**
 * 联通话费流量查询小部件
 */

import {
  isLaunchInsideApp,
  setTransparentBackground,
  showActionSheet,
  showModal,
  showNotification,
  showPreviewOptions,
  useStorage,
  request,
  sleep,
} from '@app/lib/help'
import {FC} from 'react'
import {WtextProps, WstackProps} from '@app/types/widget'

/**手机卡数据列表*/
interface PhoneDatas {
  flush_date_time: ''
  data: {
    dataList: PhoneData[]
  }
}
/**手机卡数据*/
interface PhoneData {
  displayTime: string
  paperwork4: string
  buttonBacImageUrl: string
  button7LinkMode: string
  type: PhoneDataType
  ballRippleColor1: string
  ballRippleColor2: string
  button: string
  number: string
  persentColor: string
  isShake: string
  remainTitleColoer: string
  buttonTextColor: string
  buttonAddress: string
  paperwork4Coloer: string
  buttonLinkMode: string
  buttonText7TextColor: string
  usedTitle: string
  buttonUrl7: string
  buttonText7: string
  buttonBacImageUrlBig: string
  url: string
  pointUpdateTimeStamp: string
  unit: string
  buttonBacImageUrlSmall: string
  remainTitle: string
  persent: string
  isWarn: string
  markerImg?: string
  warningTextColor?: string
  warningPointColor?: string
}

/**有用的手机卡数据*/
interface UsefulPhoneDataItem {
  /**类型*/
  type: PhoneDataType

  /**剩余百分比数字*/
  percent: number

  /**单位*/
  unit: string

  /**剩余量数字*/
  count: number

  /**描述*/
  label: string
}
interface UsefulPhoneData {
  update: string
  items: UsefulPhoneDataItem[]
}

/**手机卡数据类型*/
enum PhoneDataType {
  /**流量*/
  FLOW = 'flow',

  /**话费*/
  FEE = 'fee',

  /**语音*/
  VOICE = 'voice',

  /**积分*/
  POINT = 'point',

  /**信用分*/
  CREDIT = 'credit',

  /**电子券*/
  WOPAY = 'woPay',
}

const typeDesc: Record<PhoneDataType, string> = {
  [PhoneDataType.FLOW]: '流量',
  [PhoneDataType.FEE]: '话费',
  [PhoneDataType.VOICE]: '语音',
  [PhoneDataType.POINT]: '积分',
  [PhoneDataType.CREDIT]: '信用分',
  [PhoneDataType.WOPAY]: '电子券',
}

// 格式化数字
const formatNum = (num: number) => parseFloat(Number(num).toFixed(1))

const {setStorage, getStorage} = useStorage('china10010-xiaoming')

/**默认背景颜色*/
const defaultBgColor = Color.dynamic(new Color('#ffffff', 1), new Color('#000000', 1))

/**文字颜色*/
const textColor = getStorage<string>('textColor') || Color.dynamic(new Color('#000000', 1), new Color('#dddddd', 1))

/**透明背景*/
const transparentBg: Image | Color = getStorage<Image>('transparentBg') || defaultBgColor

/**背景颜色或背景图链接*/
const boxBg = getStorage<string>('boxBg') || defaultBgColor

class China10010 {
  async init() {
    if (isLaunchInsideApp()) {
      return await this.showMenu()
    }
    const widget = (await this.render()) as ListWidget
    Script.setWidget(widget)
    Script.complete()
  }

  //渲染组件
  async render(): Promise<unknown> {
    if (isLaunchInsideApp()) {
      await showNotification({title: '稍等片刻', body: '小部件渲染中...', sound: 'alert'})
    }
    // 多久（毫秒）更新一次小部件（默认3分钟）
    const updateInterval = 1 * 60 * 1000

    // 渲染尺寸
    const size = config.widgetFamily

    // 获取数据
    const usefulPhoneDatas = await this.getUsefulPhoneData(getStorage<string>('phoneNumber') || '')

    if (typeof usefulPhoneDatas === 'string') {
      return (
        <wbox>
          <wtext textAlign="center" font={20}>
            {usefulPhoneDatas}
          </wtext>
        </wbox>
      )
    }
    console.log(usefulPhoneDatas)
    const items = usefulPhoneDatas.items
    const update = usefulPhoneDatas.update
    return (
      <wbox
        padding={[0, 0, 0, 0]}
        updateDate={new Date(Date.now() + updateInterval)}
        background={typeof boxBg === 'string' && boxBg.match('透明背景') ? transparentBg : boxBg}
      >
        <wstack flexDirection="column" padding={[0, 16, 0, 16]}>
          <wspacer></wspacer>
          {/* 标题和logo */}
          <wstack verticalAlign="center">
            <wimage
              src="https://p.pstatp.com/origin/1381a0002e9cbaedbc301"
              width={20}
              height={20}
              borderRadius={4}
            ></wimage>
            <wspacer length={8}></wspacer>
            <wtext opacity={0.7} font={Font.boldSystemFont(14)} textColor={textColor}>
              中国联通
            </wtext>
          </wstack>
          <wspacer></wspacer>
          {/* 内容 */}
          {size === 'small' && this.renderSmall(items)}
          {size === 'medium' && this.renderMedium(items)}
          {size === 'large' && this.renderLarge(items)}
          <wstack verticalAlign="center">
            <wspacer></wspacer>
            <wtext opacity={0.7} maxLine={1} font={Font.boldSystemFont(10)} textColor={textColor}>
              {update}
            </wtext>
          </wstack>
          <wspacer></wspacer>
        </wstack>
      </wbox>
    )
  }

  // 渲染小尺寸
  renderSmall(usefulPhoneDataItems: UsefulPhoneDataItem[]) {
    const showDataType: PhoneDataType[] = [PhoneDataType.FLOW, PhoneDataType.FEE, PhoneDataType.VOICE]
    return usefulPhoneDataItems
      .filter(data => showDataType.indexOf(data.type) >= 0)
      .map(value => {
        return (
          <>
            <wtext textColor={textColor} font={Font.lightSystemFont(14)}>
              {value.label} {formatNum(value.count || 0) + value.unit}
            </wtext>
            <wspacer></wspacer>
          </>
        )
      })
  }

  // 渲染中尺寸
  renderMedium(usefulPhoneDataItems: UsefulPhoneDataItem[]) {
    const showDataType: PhoneDataType[] = [PhoneDataType.FLOW, PhoneDataType.FEE, PhoneDataType.VOICE]
    return this.renderLarge(usefulPhoneDataItems.filter(data => showDataType.indexOf(data.type) >= 0))
  }

  // 渲染大尺寸
  renderLarge(usefulPhoneDataItems: UsefulPhoneDataItem[]) {
    /**进度条*/
    const Progress: FC<{
      color: WstackProps['background']
      bgcolor: WstackProps['background']
      progress: number
      width: number
      height: number
      borderRadius?: number
    }> = ({...props}) => {
      const {color, bgcolor, progress, width, height, borderRadius = 0} = props
      return (
        <wstack background={bgcolor} width={width} height={height} borderRadius={borderRadius}>
          <wstack background={color} height={height} width={width * progress}>
            <wtext></wtext>
          </wstack>
          {progress < 1 && <wspacer></wspacer>}
        </wstack>
      )
    }

    /**表格格子*/
    const TableGrid: FC<
      WtextProps & {text: string | React.ReactNode; width: number; align: 'left' | 'center' | 'right'}
    > = ({text, width, align, ...props}) => (
      <wstack width={width}>
        {(align === 'center' || align === 'right') && <wspacer></wspacer>}
        {typeof text === 'string' ? (
          <wtext font={14} textColor={textColor} {...props}>
            {text}
          </wtext>
        ) : (
          text
        )}
        {(align === 'center' || align === 'left') && <wspacer></wspacer>}
      </wstack>
    )

    /**表格行*/
    const TableRow: FC<WtextProps & {texts: (string | React.ReactNode)[]}> = ({texts, ...props}) => (
      <wstack verticalAlign="center">
        <TableGrid text={texts[0]} {...props} width={60} align="left"></TableGrid>
        <wspacer></wspacer>
        <TableGrid text={texts[1]} {...props} width={90} align="center"></TableGrid>
        <wspacer></wspacer>
        <TableGrid text={texts[2]} {...props} width={70} align="right"></TableGrid>
      </wstack>
    )
    return (
      <>
        <TableRow texts={['类型', '剩余百分比', '剩余量']}></TableRow>
        {usefulPhoneDataItems.map(item => (
          <>
            <wspacer></wspacer>
            <TableRow
              font={Font.lightSystemFont(14)}
              texts={[
                typeDesc[item.type],
                Progress({
                  color: '#39b54a',
                  bgcolor: '#dddddd',
                  width: 80,
                  height: 10,
                  borderRadius: 5,
                  progress: formatNum(item.percent) / 100,
                }),
                formatNum(item.count) + item.unit,
              ]}
            ></TableRow>
          </>
        ))}
        <wspacer></wspacer>
      </>
    )
  }

  // 显示菜单
  async showMenu() {
    const selectIndex = await showActionSheet({
      title: '菜单',
      itemList: ['登录获取cookie', '设置手机号和cookie', '设置颜色', '设置透明背景', '预览组件'],
    })
    switch (selectIndex) {
      case 0:
        const {cancel: cancelLogin} = await showModal({
          title: '为什么要登录',
          content:
            '获取手机号码信息需要 cookie，而 cookie 不登录获取不到\n\n登录完成后，关闭网页，网页会再自动打开\n\n此时点击底部按钮复制 cookie ，然后关网页去设置cookie\n\n若 cookie 失效，再次登录复制即可',
          confirmText: '去登录',
        })
        if (cancelLogin) return
        const loginUrl = 'http://wap.10010.com/mobileService/myunicom.htm'
        const webview = new WebView()
        await webview.loadURL(loginUrl)
        await webview.present()

        /**循环插入脚本等待时间，单位：毫秒*/
        const sleepTime = 1000

        /**循环时间统计，单位：毫秒*/
        let waitTimeCount = 0

        /**最大循环时间，单位：毫秒*/
        const maxWaitTime = 10 * 60 * sleepTime

        while (true) {
          if (waitTimeCount >= maxWaitTime) break
          const {isAddCookieBtn} = (await webview.evaluateJavaScript(`
            window.isAddCookieBtn = false
            if (document.cookie.match('jsessionid')) {
              const copyWrap = document.createElement('div')
              copyWrap.innerHTML = \`
              <div style="position: fixed; bottom: 0; left: 0; z-index: 999999; width: 100vw; height: 10vh; text-align: center; line-height: 10vh; background: #000000; color: #ffffff; font-size: 16px;" id="copy-btn">复制cookie</div>
              \`
              function copy(text) {
                  var input = document.createElement('input');
                  input.setAttribute('value', text);
                  document.body.appendChild(input);
                  input.select();
                  var result = document.execCommand('copy');
                  document.body.removeChild(input);
                  return result;
              }
              document.body.appendChild(copyWrap)
              const copyBtn = document.querySelector('#copy-btn')
              copyBtn.onclick = () => {
                  copy(document.cookie)
                  copyBtn.innerText = '复制成功'
                  copyBtn.style.background = 'green'
              }
              window.isAddCookieBtn = true
            }
            Object.assign({}, {isAddCookieBtn: window.isAddCookieBtn})
          `)) as {isAddCookieBtn: boolean}
          if (isAddCookieBtn) break
          await sleep(sleepTime)
          waitTimeCount += sleepTime
        }
        await webview.present()
        break
      case 1:
        const {texts: phoneInfo, cancel: phoneInfoCancel} = await showModal({
          title: '设置手机号和cookie',
          content: '请务必先登录，在登录处复制好 cookie 再来，不懂就仔细看登录说明',
          inputItems: [
            {
              text: getStorage<string>('phoneNumber') || '',
              placeholder: '这里填你的手机号',
            },
            {
              text: getStorage<string>('cookie') || '',
              placeholder: '这里填cookie',
            },
          ],
        })
        if (phoneInfoCancel) return
        setStorage('phoneNumber', phoneInfo[0])
        setStorage('cookie', phoneInfo[1])
        await showNotification({title: '设置完成', sound: 'default'})
        break
      case 2:
        const {texts, cancel} = await showModal({
          title: '设置全局背景和颜色',
          content: '如果为空，则还原默认',
          inputItems: [
            {
              text: getStorage<string>('boxBg') || '',
              placeholder: '全局背景：可以是颜色、图链接',
            },
            {
              text: getStorage<string>('textColor') || '',
              placeholder: '这里填文字颜色',
            },
          ],
        })
        if (cancel) return
        setStorage('boxBg', texts[0])
        setStorage('textColor', texts[1])
        await showNotification({title: '设置完成', sound: 'default'})
        break
      case 3:
        const img: Image | null = (await setTransparentBackground()) || null
        if (img) {
          setStorage('transparentBg', img)
          setStorage('boxBg', '透明背景')
          await showNotification({title: '设置透明背景成功', sound: 'default'})
        }
        break
      case 4:
        await showPreviewOptions(this.render.bind(this))
        break
    }
  }

  // 获取手机卡数据
  async getUsefulPhoneData(phoneNumber: string): Promise<UsefulPhoneData | string> {
    if (!phoneNumber) return '请设置手机号'
    if (!isLaunchInsideApp() && !getStorage('cookie')) return 'cookie 不存在，请先登录'
    const api = `https://m.client.10010.com/mobileService/home/queryUserInfoSeven.htm?showType=3&version=iphone_c@7.0600&desmobiel=${phoneNumber}`
    // 获取手机卡信息列表
    const res = await request<string>({
      url: api,
      dataType: 'text',
      header: {
        'user-agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        cookie: getStorage<string>('cookie') || '',
      },
    })
    // isLaunchInsideApp() && cookie && setStorage('cookie', cookie)
    let usefulPhoneDatas: UsefulPhoneDataItem[] = []
    let flush_date_time = ''
    try {
      const parse = JSON.parse(res.data || '') as PhoneDatas
      flush_date_time = parse.flush_date_time
      const phoneDatas: PhoneData[] = parse.data.dataList || []
      // 提取有用的信息
      usefulPhoneDatas = phoneDatas.map(info => {
        const percent = info.usedTitle.replace(/(已用|剩余)([\d\.]+)?\%/, (...args) => {
          return args[1] === '剩余' ? args[2] : 100 - args[2]
        })
        return {
          type: info.type,
          percent: Number(percent) > 100 ? 100 : Number(percent),
          unit: info.unit,
          count: Number(info.number),
          label: info.remainTitle,
        }
      })
    } catch (err) {
      console.warn(`获取联通卡信息失败: ${err}`)
      await showNotification({title: '获取联通卡信息失败', body: '检查一下网络，或重新登录', sound: 'failure'})
      return '获取联通卡信息失败\n检查一下网络，或重新登录'
    }
    return {update: flush_date_time, items: usefulPhoneDatas}
  }
}

EndAwait(() => new China10010().init())
