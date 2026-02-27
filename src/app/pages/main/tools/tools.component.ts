import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Tool {
  name: string;
  description: string;
  downloadUrl?: string;
  isAppStore?: boolean;
}

interface PlatformCategory {
  platformName: string;
  platformId: 'android' | 'windows' | 'ios' | 'macos' | 'linux';
  iconPath: string;
  tools: Tool[];
}

interface RecommendedTool {
  platform: string;
  name: string;
  bgColor: string;
}

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class ToolsComponent {
  private readonly ICONS = {
    ANDROID: 'M10.5 19.5h3m-6.75 0h6.75c.621 0 1.125-.504 1.125-1.125v-15c0-.621-.504-1.125-1.125-1.125h-6.75c-.621 0-1.125.504-1.125 1.125v15c0 .621.504 1.125 1.125 1.125z',
    WINDOWS: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    IOS: 'M10.5 19.5h3m-6.75 0h6.75c.621 0 1.125-.504 1.125-1.125v-15c0-.621-.504-1.125-1.125-1.125h-6.75c-.621 0-1.125.504-1.125 1.125v15c0 .621.504 1.125 1.125 1.125z',
    MACOS: 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3',
    LINUX: 'M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L12 15.25l5.571-3M6.429 9.75L12 15.25l5.571-5.5'
  };

  showAppStoreModal = signal(false);
  appStoreModalContent = signal({ title: '', toolName: '' });

  activeTab = signal<string>('android');

  categories: PlatformCategory[] = [
    {
      platformName: 'Android (安卓)',
      platformId: 'android',
      iconPath: this.ICONS.ANDROID,
      tools: [
        { name: 'v2rayNG', description: '兼容性最强，支持协议最全，新手首选。', downloadUrl: 'assets/downloads/v2rayng.apk' },
        { name: 'Clash Meta', description: '支持强大的规则分流，适合有精细化上网需求的用户。', downloadUrl: 'assets/downloads/clash_meta.apk' },
        { name: 'NekoBox', description: '基于 Sing-box 内核，支持协议极多，界面硬核，功能极其强大。', downloadUrl: 'assets/downloads/nekobox.apk' },
        { name: 'Hiddify', description: '界面极简现代，支持自动选择节点，一键连接。', downloadUrl: 'assets/downloads/hiddify_android.apk' },
        { name: 'Sing-box', description: '官方原生客户端，性能天花板，但配置门槛较高。', downloadUrl: 'assets/downloads/sing-box_android.apk' },
      ],
    },
    {
      platformName: 'Windows (桌面端)',
      platformId: 'windows',
      iconPath: this.ICONS.WINDOWS,
      tools: [
        { name: 'v2rayN', description: '功能最全，支持 Xray/Sing-box/Trojan 等几乎所有内核。', downloadUrl: 'assets/downloads/v2rayN_win.zip' },
        { name: 'Clash Verge Rev', description: '界面美观，支持脚本扩展，是目前最推荐的 Clash 客户端。', downloadUrl: 'assets/downloads/clash_verge_rev_win.exe' },
        { name: 'NekoRay', description: 'Windows 端的 NekoBox，支持多内核切换，适合追求稳定的用户。', downloadUrl: 'assets/downloads/nekoray_win.zip' },
        { name: 'Hiddify', description: '跨平台体验，无需复杂配置，适合追求效率的用户。', downloadUrl: 'assets/downloads/hiddify_win.exe' },
      ],
    },
    {
      platformName: 'iOS (iPhone/iPad)',
      platformId: 'ios',
      iconPath: this.ICONS.IOS,
      tools: [
        { name: 'Shadowrocket', description: '俗称“小火箭”，支持协议多，操作简单，价格便宜。', isAppStore: true },
        { name: 'Stash', description: 'iOS 上的 Clash 完美替代品，支持所有 Clash 规则。', isAppStore: true },
        { name: 'Quantumult X', description: '俗称“圈 X”，支持强大的脚本、重写和自定义分流。', isAppStore: true },
        { name: 'Surge', description: '价格最贵，功能最强，支持极其专业的网络调试。', isAppStore: true },
        { name: 'Hiddify', description: 'iOS 上难得的免费且支持多种协议的工具。', isAppStore: true },
      ],
    },
    {
      platformName: 'macOS (苹果电脑)',
      platformId: 'macos',
      iconPath: this.ICONS.MACOS,
      tools: [
        { name: 'Clash Verge Rev', description: '完美适配 M1/M2 芯片，界面现代，功能全面。', downloadUrl: 'assets/downloads/clash_verge_rev_mac.dmg' },
        { name: 'v2rayN', description: '经典的 V2Ray 客户端，适合不需要复杂规则的用户。', downloadUrl: 'assets/downloads/v2rayn_mac.dmg' },
        { name: 'ClashX', description: '极度追求简洁、Intel 芯片下载。', downloadUrl: 'assets/downloads/clashx_mac.dmg' },
        { name: 'Hiddify', description: '适合在多个系统间切换并希望保持一致体验的用户。', downloadUrl: 'assets/downloads/hiddify_mac.dmg' },
      ],
    },
    {
      platformName: 'Linux (开源系统)',
      platformId: 'linux',
      iconPath: this.ICONS.LINUX,
      tools: [
        { name: 'v2rayN', description: '经典的 V2Ray 客户端，适合不需要复杂规则的用户。', downloadUrl: 'assets/downloads/v2rayn_linux.zip' },
        { name: 'Clash Verge Rev', description: '提供 AppImage，在 Ubuntu/Arch 等系统上体验极佳。', downloadUrl: 'assets/downloads/clash_verge_rev_linux.deb' },
        { name: 'NekoRay', description: '兼容性极强，支持多种内核，Linux 用户的忠实选择。', downloadUrl: 'assets/downloads/nekoray_linux.zip' },
      ],
    },
  ];

  recommendedTools: RecommendedTool[] = [
    { platform: 'Android', name: 'v2rayNG', bgColor: 'bg-teal-100' },
    { platform: 'iOS', name: 'Shadowrocket', bgColor: 'bg-green-100' },
    { platform: 'macOS', name: 'Clash Verge Rev', bgColor: 'bg-gray-200' },
    { platform: 'Windows', name: 'Clash Verge Rev', bgColor: 'bg-blue-100' },
    { platform: 'Linux', name: 'Clash Verge Rev', bgColor: 'bg-purple-100' },
  ];

  openAppStoreInfo(toolName: string): void {
    this.appStoreModalContent.set({
      title: '应用商店下载指南',
      toolName: toolName,
    });
    this.showAppStoreModal.set(true);
  }

  closeAppStoreModal(): void {
    this.showAppStoreModal.set(false);
  }

  setActiveTab(tabId: string): void {
    this.activeTab.set(tabId);
  }
}
