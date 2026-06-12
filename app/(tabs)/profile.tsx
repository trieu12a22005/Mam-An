import { AppText as Text } from '../../src/components/common/AppText';
import React, { useState } from 'react';
import {
  View, ScrollView, StyleSheet, TouchableOpacity,
  Switch, Modal, Image, Animated, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Screen } from '../../src/components/common/Screen';
import { ThemedScreen } from '../../src/components/theme/ThemedScreen';
import { PlantAvatar } from '../../src/components/plant/PlantAvatar';
import { LoadingView } from '../../src/components/common/LoadingView';
import { useAuth } from '../../src/hooks/useAuth';
import { useVirtualPlant } from '../../src/hooks/usePlant';
import { useTimeTheme } from '../../src/contexts/TimeThemeContext';
import { AppThemeMode } from '../../src/types/theme.type';
import { COLORS } from '../../src/constants/colors';
import { PLANT_STAGES } from '../../src/constants/plantStages';

// ── Mascot farewell messages ────────────────────────────────────────────────
const FAREWELL_MESSAGES = [
  'Bạn muốn chào tạm biệt rồi sao? 🥺\nCây vẫn sẽ nhớ bạn mỗi ngày...',
  'Ôi không! Đừng đi vội mà 🌿\nCây đang chờ được chăm sóc tiếp đó!',
  'Tạm biệt nhé bạn ơi 🍃\nHẹn gặp lại, cây luôn ở đây chờ bạn~',
  'Nghỉ ngơi một chút cũng được 😊\nNhưng đừng quên quay lại chăm mình nha!',
];

// ── Helper components ────────────────────────────────────────────────────────

const Divider = () => {
  const { colors } = useTimeTheme();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
};

const SettingRow: React.FC<{
  label: string;
  icon: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}> = ({ label, icon, right, onPress, danger }) => {
  const { colors } = useTimeTheme();
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.65 : 1}
      disabled={!onPress}
    >
      <View style={[styles.settingIconWrap, { backgroundColor: colors.background }, danger && styles.settingIconDanger]}>
        <Text style={styles.settingIcon}>{icon}</Text>
      </View>
      <Text style={[styles.settingLabel, { color: colors.text }, danger && { color: '#EF4444' }]}>{label}</Text>
      <View style={styles.settingRight}>
        {right ?? <Text style={[styles.settingArrow, { color: colors.textMuted }]}>›</Text>}
      </View>
    </TouchableOpacity>
  );
};

const StatBadge: React.FC<{ value: string | number; label: string; color: string }> = ({
  value, label, color,
}) => (
  <View style={styles.statItem}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ── Logout Modal ─────────────────────────────────────────────────────────────
const LogoutModal: React.FC<{
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}> = ({ visible, onCancel, onConfirm }) => {
  const { colors } = useTimeTheme();
  const msg = FAREWELL_MESSAGES[Math.floor(Math.random() * FAREWELL_MESSAGES.length)];
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <Pressable style={styles.modalBackdrop} onPress={onCancel}>
        <Pressable style={[styles.modalCard, { backgroundColor: colors.surface }]} onPress={() => {}}>
          {/* Mascot */}
          <View style={styles.mascotWrap}>
            <Image
              source={require('../../assets/thinking.png')}
              style={styles.mascotImg}
              resizeMode="contain"
            />
          </View>

          {/* Message bubble */}
          <View style={[styles.bubble, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
            <Text style={[styles.bubbleText, { color: colors.text }]}>{msg}</Text>
          </View>

          {/* Title */}
          <Text style={[styles.modalTitle, { color: colors.text }]}>Đăng xuất?</Text>
          <Text style={[styles.modalSub, { color: colors.textMuted }]}>
            Bạn vẫn có thể quay lại bất cứ lúc nào 🌱
          </Text>

          {/* Buttons */}
          <View style={styles.modalBtns}>
            <TouchableOpacity style={[styles.btnCancel, { backgroundColor: colors.surfaceSoft }]} onPress={onCancel} activeOpacity={0.8}>
              <Text style={[styles.btnCancelText, { color: colors.text }]}>Ở lại chăm cây</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnConfirm, { backgroundColor: '#EF4444' }]} onPress={onConfirm} activeOpacity={0.8}>
              <Text style={[styles.btnConfirmText, { color: '#ffffff' }]}>Tạm biệt 👋</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// ── Flower choice card ────────────────────────────────────────────────────────
const ChoiceCard: React.FC<{
  selected: boolean;
  onSelect: () => void;
  emoji: string;
  title: string;
  subtitle: string;
}> = ({ selected, onSelect, emoji, title, subtitle }) => {
  const { colors } = useTimeTheme();
  return (
    <TouchableOpacity
      style={[
        styles.choiceCard,
        { backgroundColor: colors.background, borderColor: colors.border },
        selected && { backgroundColor: colors.primarySoft, borderColor: colors.primary }
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <Text style={styles.choiceEmoji}>{emoji}</Text>
      <View style={styles.choiceTexts}>
        <Text style={[styles.choiceTitle, { color: colors.text }, selected && { color: colors.primary }]}>{title}</Text>
        <Text style={[styles.choiceSub, { color: colors.textMuted }]}>{subtitle}</Text>
      </View>
      <View style={[styles.radio, { borderColor: colors.border }, selected && { borderColor: colors.primary }]}>
        {selected && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
      </View>
    </TouchableOpacity>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Profile() {
  const { user, logout } = useAuth();
  const { plant, isLoading } = useVirtualPlant();
  const { settings, toggleTimeTheme, toggleNightEffects, setThemeMode, colors, isNight } = useTimeTheme();
  const [flowerChoice, setFlowerChoice] = useState<'ship' | 'donate' | null>(null);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const THEME_MODE_OPTIONS: { mode: AppThemeMode; label: string; desc: string }[] = [
    { mode: 'AUTO', label: 'Theo thời gian', desc: 'Tự đổi màu theo buổi sáng/chiều/tối' },
    { mode: 'LIGHT', label: 'Luôn sáng', desc: 'Tone xanh lá kem sáng' },
    { mode: 'DARK', label: 'Luôn tối', desc: 'Khu vườn ban đêm' },
  ];

  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace('/login');
  };

  if (isLoading) return <LoadingView />;

  const stageInfo = plant ? PLANT_STAGES[plant.status] : null;
  const initials = (user?.fullName ?? 'B')
    .split(' ')
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  return (
    <ThemedScreen showNightEffects>
      <LogoutModal
        visible={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />

      <ScrollView
        style={[styles.scroll, { backgroundColor: 'transparent' }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero header ── */}
        <LinearGradient
          colors={isNight ? ['#0F2B1E', '#143D25', '#1F4632'] : ['#2D7A4F', '#34C759', '#86EFAC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {/* Deco blobs */}
          <View style={styles.blob1} />
          <View style={styles.blob2} />

          {/* Avatar */}
          <View style={styles.avatarOuter}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          </View>

          <Text style={styles.heroName}>{user?.fullName ?? 'Bạn'}</Text>
          <Text style={styles.heroEmail}>{user?.email}</Text>

          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>🌿 {user?.role ?? 'USER'}</Text>
          </View>

          {/* Stats row */}
          {plant && (
            <View style={styles.statsRow}>
              <StatBadge
                value={stageInfo?.label ?? '—'}
                label="Giai đoạn"
                color="#fff"
              />
              <View style={styles.statDivider} />
              <StatBadge
                value={plant.growthPoint ?? 0}
                label="Điểm phát triển"
                color="#fff"
              />
              <View style={styles.statDivider} />
              <StatBadge
                value={plant.realPlant ? '✓' : '—'}
                label="Cây thật"
                color="#fff"
              />
            </View>
          )}
        </LinearGradient>

        <View style={styles.body}>
          {/* ── Plant card ── */}
          {plant && (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.textMuted }]}>🌱 Cây đang trồng</Text>
              <View style={styles.plantRow}>
                <PlantAvatar status={plant.status} size="sm" />
                <View style={styles.plantInfo}>
                  <Text style={[styles.plantName, { color: colors.text }]}>
                    {plant.nickname ?? 'Cây chưa đặt tên'}
                  </Text>
                  <Text style={[styles.plantDetail, { color: colors.textMuted }]}>
                    {plant.flowerType.name} · {stageInfo?.label}
                  </Text>
                  {plant.realPlant && (
                    <View style={[styles.codePill, { backgroundColor: colors.primarySoft }]}>
                      <Text style={[styles.codeText, { color: colors.primary }]}>#{plant.realPlant.code}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* ── Package card ── */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.textMuted }]}>🌻 Gói hoa đồng hành</Text>
            <View style={styles.packageBanner}>
              <Text style={styles.packageBannerTitle}>Hoa Hướng Dương Đồng Hành</Text>
              <Text style={styles.packageBannerDesc}>
                Sau khi hoa nở, bạn có thể chọn ship về nhà hoặc tặng lại cho người cần.
              </Text>
            </View>

            <Text style={[styles.choiceLabel, { color: colors.textMuted }]}>Lựa chọn của bạn sau khi hoa nở</Text>
            <ChoiceCard
              selected={flowerChoice === 'ship'}
              onSelect={() => setFlowerChoice('ship')}
              emoji="📦"
              title="Ship về nhà"
              subtitle="Chúng tôi sẽ gửi hoa đến địa chỉ của bạn"
            />
            <View style={{ height: 10 }} />
            <ChoiceCard
              selected={flowerChoice === 'donate'}
              onSelect={() => setFlowerChoice('donate')}
              emoji="💚"
              title="Tặng lại cho người cần"
              subtitle="Hoa sẽ được trao đến nơi có ý nghĩa hơn"
            />
            {flowerChoice && (
              <Text style={styles.choiceSaved}>✓ Đã lưu lựa chọn của bạn</Text>
            )}
          </View>

          {/* ── Theme settings card ── */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.textMuted }]}>🌑 Giao diện</Text>
            <Text style={[styles.themeHint, { color: colors.textMuted }]}>
              Buổi tối, khu vườn sẽ dịu lại và có vài vì sao nhỏ để bạn thư giãn hơn.
            </Text>

            <SettingRow
              icon="⏰"
              label="Tự đổi giao diện theo thời gian"
              right={
                <Switch
                  value={settings.enableTimeTheme}
                  onValueChange={toggleTimeTheme}
                  trackColor={{ true: colors.primary, false: colors.border }}
                  thumbColor={'#fff'}
                />
              }
            />
            <Divider />
            <SettingRow
              icon="✨"
              label="Hiệu ứng sao đêm"
              right={
                <Switch
                  value={settings.enableNightEffects}
                  onValueChange={toggleNightEffects}
                  trackColor={{ true: colors.primary, false: colors.border }}
                  thumbColor={'#fff'}
                />
              }
            />
            <Divider />
            <Text style={[styles.themeModeLabel, { color: colors.textMuted }]}>Chế độ giao diện</Text>
            <View style={styles.themeModeRow}>
              {THEME_MODE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.mode}
                  style={[
                    styles.themeModeBtn,
                    { borderColor: colors.border, backgroundColor: colors.background },
                    settings.themeMode === opt.mode && { borderColor: colors.primary, backgroundColor: colors.primarySoft },
                  ]}
                  onPress={() => setThemeMode(opt.mode)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.themeModeBtnText,
                    { color: colors.textMuted },
                    settings.themeMode === opt.mode && { color: colors.primary },
                  ]}>
                    {opt.label}
                  </Text>
                  <Text style={[styles.themeModeBtnDesc, { color: colors.textMuted }]}>{opt.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Settings card ── */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.textMuted }]}>⚙️ Cài đặt</Text>
            <SettingRow
              icon="🔔"
              label="Thông báo nhắc nhở"
              right={
                <Switch
                  value={notifEnabled}
                  onValueChange={setNotifEnabled}
                  trackColor={{ true: colors.primary, false: colors.border }}
                  thumbColor={'#fff'}
                />
              }
            />
            <Divider />
            <SettingRow
              icon="🎁"
              label="Gói dịch vụ của tôi"
              onPress={() => router.push('/packages')}
            />
            <Divider />
            <SettingRow
              icon="📦"
              label="Đơn hàng của tôi"
              onPress={() => router.push('/my-orders')}
            />
            <Divider />
            <SettingRow icon="ℹ️" label="Về ứng dụng" onPress={() => {}} />
          </View>

          {/* ── Disclaimer ── */}
          <View style={[styles.disclaimer, { backgroundColor: colors.surfaceSoft }]}>
            <Text style={[styles.disclaimerText, { color: colors.textMuted }]}>
              🌿 Garden Mobile hỗ trợ self-care và không thay thế tư vấn chuyên gia sức khỏe tâm thần.
            </Text>
          </View>

          {/* ── Logout button ── */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedScreen>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { paddingBottom: 48 },

  // Hero
  hero: {
    paddingTop: 56,
    paddingBottom: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  blob2: {
    position: 'absolute', bottom: -30, left: -30,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  avatarOuter: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 12,
    elevation: 8,
  },
  avatarInner: {
    flex: 1, borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInitials: { fontSize: 36, fontWeight: '800', color: '#fff' },
  heroName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  heroEmail: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14, paddingVertical: 4,
    borderRadius: 20, marginTop: 2,
  },
  heroBadgeText: { fontSize: 12, color: '#fff', fontWeight: '700' },

  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 8,
    alignSelf: 'stretch',
  },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statValue: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginVertical: 4 },

  // Body
  body: { padding: 20, gap: 16 },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 10,
    elevation: 2,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text.muted, letterSpacing: 0.5 },

  // Theme settings
  themeHint: {
    fontSize: 12, color: COLORS.text.secondary,
    lineHeight: 18, fontStyle: 'italic',
  },
  themeModeLabel: {
    fontSize: 13, color: COLORS.text.secondary, fontWeight: '500', marginTop: 4,
  },
  themeModeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  themeModeBtn: {
    flex: 1, borderRadius: 12, padding: 10,
    borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center', gap: 3,
  },
  themeModeBtnActive: {
    borderColor: COLORS.green.main,
    backgroundColor: COLORS.green[50],
  },
  themeModeBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.text.secondary },
  themeModeBtnTextActive: { color: COLORS.green.dark },
  themeModeBtnDesc: { fontSize: 10, color: COLORS.text.muted, textAlign: 'center' },


  // Plant row
  plantRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  plantInfo: { flex: 1, gap: 6 },
  plantName: { fontSize: 16, fontWeight: '700', color: COLORS.text.primary },
  plantDetail: { fontSize: 13, color: COLORS.text.secondary },
  codePill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.green[100],
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 12,
  },
  codeText: { fontSize: 11, color: COLORS.green.dark, fontWeight: '600' },

  // Package
  packageBanner: {
    backgroundColor: '#FFF8E7',
    borderRadius: 12, padding: 14, gap: 6,
    borderWidth: 1, borderColor: '#FFE082',
  },
  packageBannerTitle: { fontSize: 14, fontWeight: '700', color: '#7B5800' },
  packageBannerDesc: { fontSize: 12, color: '#8D6E00', lineHeight: 18 },
  choiceLabel: { fontSize: 13, color: COLORS.text.secondary },
  choiceCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  choiceCardSelected: {
    borderColor: COLORS.green.main,
    backgroundColor: COLORS.green[50],
  },
  choiceEmoji: { fontSize: 28 },
  choiceTexts: { flex: 1, gap: 3 },
  choiceTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary },
  choiceTitleSelected: { color: COLORS.green.dark },
  choiceSub: { fontSize: 12, color: COLORS.text.muted, lineHeight: 18 },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  radioSelected: { borderColor: COLORS.green.main },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.green.main },
  choiceSaved: {
    fontSize: 12, color: COLORS.green.main,
    fontWeight: '600', textAlign: 'center', marginTop: 4,
  },

  // Settings
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 13,
  },
  settingIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.green[50],
    justifyContent: 'center', alignItems: 'center',
  },
  settingIconDanger: { backgroundColor: '#FFF0F0' },
  settingIcon: { fontSize: 18 },
  settingLabel: { flex: 1, fontSize: 15, color: COLORS.text.primary },
  settingLabelDanger: { color: COLORS.danger },
  settingRight: { alignItems: 'flex-end' },
  settingArrow: { fontSize: 20, color: COLORS.text.muted },

  divider: { height: 1, backgroundColor: COLORS.border },

  // Disclaimer
  disclaimer: {
    backgroundColor: COLORS.green[50],
    borderRadius: 14, padding: 14,
    borderLeftWidth: 3, borderLeftColor: COLORS.green.main,
  },
  disclaimerText: { fontSize: 12, color: COLORS.text.secondary, lineHeight: 20 },

  // Logout
  logoutBtn: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFCDD2',
    backgroundColor: '#FFF5F5',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: COLORS.danger },

  // Modal
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingHorizontal: 24, paddingBottom: 28, paddingTop: 0,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15, shadowRadius: 24,
    elevation: 16,
    gap: 10,
  },
  mascotWrap: {
    marginTop: -48,
    marginBottom: 4,
    width: 130, height: 130,
    borderRadius: 65,
    backgroundColor: COLORS.green[50],
    borderWidth: 3, borderColor: COLORS.green.light,
    overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  mascotImg: { width: 120, height: 120 },
  bubble: {
    backgroundColor: COLORS.green[50],
    borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: COLORS.green.light,
    alignSelf: 'stretch',
  },
  bubbleText: {
    fontSize: 14, color: COLORS.text.secondary,
    lineHeight: 22, textAlign: 'center', fontStyle: 'italic',
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text.primary },
  modalSub: { fontSize: 13, color: COLORS.text.muted, textAlign: 'center' },
  modalBtns: { flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 4 },
  btnCancel: {
    flex: 1, borderRadius: 14, paddingVertical: 14,
    backgroundColor: COLORS.green.main,
    alignItems: 'center',
  },
  btnCancelText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  btnConfirm: {
    flex: 1, borderRadius: 14, paddingVertical: 14,
    backgroundColor: '#FFF5F5',
    borderWidth: 1, borderColor: '#FFCDD2',
    alignItems: 'center',
  },
  btnConfirmText: { fontSize: 14, fontWeight: '600', color: COLORS.danger },
});
