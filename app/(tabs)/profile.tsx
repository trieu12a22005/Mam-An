import { AppText as Text } from '../../src/components/common/AppText';
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../src/components/common/Screen';
import { AppButton } from '../../src/components/common/AppButton';
import { PlantAvatar } from '../../src/components/plant/PlantAvatar';
import { LoadingView } from '../../src/components/common/LoadingView';
import { useAuth } from '../../src/hooks/useAuth';
import { useVirtualPlant } from '../../src/hooks/usePlant';
import { COLORS } from '../../src/constants/colors';
import { PLANT_STAGES } from '../../src/constants/plantStages';

type FlowerChoice = 'ship' | 'donate' | null;

// ── Setting row ───────────────────────────────────────────────────────────────
const SettingRow: React.FC<{
  label: string;
  icon: string;
  right?: React.ReactNode;
  onPress?: () => void;
}> = ({ label, icon, right, onPress }) => (
  <TouchableOpacity
    style={sRow.row}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    disabled={!onPress}
  >
    <Text style={sRow.icon}>{icon}</Text>
    <Text style={sRow.label}>{label}</Text>
    <View style={sRow.right}>{right ?? <Text style={sRow.arrow}>›</Text>}</View>
  </TouchableOpacity>
);
const sRow = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, gap: 14,
  },
  icon: { fontSize: 22, width: 28, textAlign: 'center' },
  label: { flex: 1, fontSize: 15, color: COLORS.text.primary },
  right: { alignItems: 'flex-end' },
  arrow: { fontSize: 20, color: COLORS.text.muted },
});

// ── Flower choice card ────────────────────────────────────────────────────────
const ChoiceCard: React.FC<{
  selected: boolean;
  onSelect: () => void;
  emoji: string;
  title: string;
  subtitle: string;
}> = ({ selected, onSelect, emoji, title, subtitle }) => (
  <TouchableOpacity
    style={[cStyle.card, selected && cStyle.cardSelected]}
    onPress={onSelect}
    activeOpacity={0.8}
  >
    <Text style={cStyle.emoji}>{emoji}</Text>
    <View style={cStyle.texts}>
      <Text style={[cStyle.title, selected && cStyle.titleSelected]}>{title}</Text>
      <Text style={cStyle.sub}>{subtitle}</Text>
    </View>
    <View style={[cStyle.radio, selected && cStyle.radioSelected]}>
      {selected && <View style={cStyle.radioDot} />}
    </View>
  </TouchableOpacity>
);
const cStyle = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 14, padding: 16,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  cardSelected: {
    borderColor: COLORS.green.main,
    backgroundColor: COLORS.green[50],
  },
  emoji: { fontSize: 30 },
  texts: { flex: 1, gap: 4 },
  title: { fontSize: 15, fontWeight: '600', color: COLORS.text.primary },
  titleSelected: { color: COLORS.green.dark },
  sub: { fontSize: 12, color: COLORS.text.muted, lineHeight: 18 },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  radioSelected: { borderColor: COLORS.green.main },
  radioDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: COLORS.green.main,
  },
});

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title, children,
}) => (
  <View style={secStyle.section}>
    <Text style={secStyle.title}>{title}</Text>
    <View style={secStyle.body}>{children}</View>
  </View>
);
const secStyle = StyleSheet.create({
  section: { gap: 12 },
  title: { fontSize: 13, fontWeight: '700', color: COLORS.text.muted, letterSpacing: 0.8, textTransform: 'uppercase' },
  body: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
});

// ── Main Profile screen ───────────────────────────────────────────────────────
export default function Profile() {
  const { user, logout } = useAuth();
  const { plant, isLoading } = useVirtualPlant();
  const [flowerChoice, setFlowerChoice] = useState<FlowerChoice>(null);
  const [notifEnabled, setNotifEnabled] = useState(true);

  const handleLogout = async () => {
    Alert.alert('Đăng xuất', 'Bạn muốn đăng xuất khỏi Garden Mobile?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  if (isLoading) return <LoadingView />;

  const stageLabel = plant ? PLANT_STAGES[plant.status]?.label : '—';

  return (
    <Screen scroll padded>
      {/* ── Avatar & name ── */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>🧑</Text>
        </View>
        <Text style={styles.name}>{user?.fullName ?? 'Bạn'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role ?? 'USER'}</Text>
        </View>
      </View>

      <View style={styles.sections}>
        {/* ── Plant info ── */}
        {plant && (
          <Section title="Cây đang trồng">
            <View style={styles.plantRow}>
              <PlantAvatar status={plant.status} size="sm" />
              <View style={styles.plantInfo}>
                <Text style={styles.plantName}>
                  {plant.nickname ?? 'Cây chưa đặt tên'}
                </Text>
                <Text style={styles.plantDetail}>
                  {plant.flowerType.name} · {stageLabel}
                </Text>
                {plant.realPlant && (
                  <Text style={styles.plantCode}>
                    Mã cây: {plant.realPlant.code}
                  </Text>
                )}
              </View>
            </View>
          </Section>
        )}

        {/* ── Package ── */}
        <Section title="Gói hoa đồng hành">
          <View style={styles.packageCard}>
            <Text style={styles.packageTitle}>🌻 Gói Hoa Hướng Dương Đồng Hành</Text>
            <Text style={styles.packageDesc}>
              Sau khi hoa nở, bạn có thể chọn ship về nhà hoặc tặng lại cho người cần.
            </Text>
          </View>

          <Text style={[styles.choiceLabel, { paddingHorizontal: 16, paddingBottom: 12 }]}>
            Lựa chọn của bạn sau khi hoa nở
          </Text>
          <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 10 }}>
            <ChoiceCard
              selected={flowerChoice === 'ship'}
              onSelect={() => setFlowerChoice('ship')}
              emoji="📦"
              title="Ship về nhà"
              subtitle="Chúng tôi sẽ gửi hoa đến địa chỉ của bạn"
            />
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
        </Section>

        {/* ── Settings ── */}
        <Section title="Cài đặt">
          <SettingRow
            icon="🔔"
            label="Thông báo nhắc nhở"
            right={
              <Switch
                value={notifEnabled}
                onValueChange={setNotifEnabled}
                trackColor={{ true: COLORS.green.main, false: COLORS.border }}
                thumbColor={COLORS.white}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="🔔"
            label="Xem thông báo"
            onPress={() => router.push('/notifications')}
          />
          <View style={styles.divider} />
          <SettingRow icon="ℹ️" label="Về ứng dụng" onPress={() => {}} />
        </Section>

        {/* ── Disclaimer ── */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            🌿 Garden Mobile hỗ trợ self-care và không thay thế tư vấn chuyên gia sức khỏe tâm thần.
          </Text>
        </View>

        {/* ── Logout ── */}
        <AppButton
          title="Đăng xuất"
          variant="ghost"
          onPress={handleLogout}
          style={styles.logoutBtn}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 28,
    gap: 6,
  },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: COLORS.green.light,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  avatarEmoji: { fontSize: 44 },
  name: { fontSize: 22, fontWeight: '700', color: COLORS.text.primary },
  email: { fontSize: 14, color: COLORS.text.muted },
  roleBadge: {
    backgroundColor: COLORS.green.light,
    paddingHorizontal: 14, paddingVertical: 4,
    borderRadius: 20, marginTop: 4,
  },
  roleText: { fontSize: 12, color: COLORS.green.dark, fontWeight: '600' },

  sections: { gap: 24, paddingBottom: 40 },

  plantRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 16, padding: 16,
  },
  plantInfo: { flex: 1, gap: 4 },
  plantName: { fontSize: 16, fontWeight: '700', color: COLORS.text.primary },
  plantDetail: { fontSize: 13, color: COLORS.text.secondary },
  plantCode: { fontSize: 12, color: COLORS.text.muted },

  packageCard: {
    margin: 16, marginBottom: 0,
    backgroundColor: '#FFF8E7',
    borderRadius: 14, padding: 16, gap: 8,
    borderWidth: 1, borderColor: '#FFE082',
  },
  packageTitle: { fontSize: 15, fontWeight: '700', color: '#7B5800' },
  packageDesc: { fontSize: 13, color: '#8D6E00', lineHeight: 20 },
  choiceLabel: { fontSize: 14, color: COLORS.text.secondary, marginTop: 12 },
  choiceSaved: {
    fontSize: 13, color: COLORS.green.main,
    fontWeight: '600', textAlign: 'center',
  },

  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 16 },

  disclaimer: {
    backgroundColor: COLORS.green[50],
    borderRadius: 14, padding: 16,
    borderLeftWidth: 3, borderLeftColor: COLORS.green.main,
  },
  disclaimerText: { fontSize: 13, color: COLORS.text.secondary, lineHeight: 22 },

  logoutBtn: {
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 14,
  },
});
