// src/screens/common/SettingsScreen.js
import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, StatusBar, TouchableOpacity, Modal, FlatList } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import * as Animatable from 'react-native-animatable';
import {
  User,
  BadgeCheck,
  KeyRound,
  Mail,
  Info,
  LogOut,
  Shield,
  BellRing,
  Download,
  ChevronRight,
  Globe,
  Check
} from 'lucide-react-native';
import UpdateProfileScreen from '../common/UpdateProfileScreen.js';


// --- Begin business profile setup modal component ---
function BusinessProfileSetupModal({ visible, onClose }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet" // or 'fullScreen'
      transparent={false}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.modalCloseButton}
          >
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Business Profile Setup</Text>
          {/* A dummy view to balance the header layout if needed, or remove if not necessary for visual balance */}
          <View style={styles.modalCloseButton} />
        </View>
       
        <UpdateProfileScreen />
      </View>
    </Modal>
  );
}
// --- End business profile setup modal component ---

export default function SettingsScreen() {
  const { userName, userRole, logout } = useContext(AuthContext);
  const alertCtx = useContext(AlertContext);
  const { t, currentLanguage, changeLanguage, getAvailableLanguages, getCurrentLanguageInfo } = useLanguage();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  // Business Profile Setup modal state
  const [businessProfileModalVisible, setBusinessProfileModalVisible] = useState(false);

  const handleLogout = async () => {
    await logout();
    alertCtx && alertCtx.showAlert && alertCtx.showAlert({
      title: t('messages.loggedOut'),
      message: t('messages.youHaveBeenLoggedOut'),
      type: 'info',
    });
  };

  const handleLanguageChange = async (languageCode) => {
    await changeLanguage(languageCode);
    setLanguageModalVisible(false);
    alertCtx && alertCtx.showAlert && alertCtx.showAlert({
      title: t('common.success'),
      message: t('settings.languageChanged'),
      type: 'success',
    });
  };

  const SettingItem = ({ icon: Icon, title, onPress, isDestructive = false }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.settingIconContainer,
        isDestructive && styles.destructiveIconContainer
      ]}>
        <Icon 
          size={20} 
          color={isDestructive ? '#E74C3C' : '#2C3E50'} 
          strokeWidth={2.5} 
        />
      </View>
      <Text style={[
        styles.settingTitle,
        isDestructive && styles.destructiveText
      ]}>
        {title}
      </Text>
      <ChevronRight 
        size={20} 
        color="#95A5A6" 
        strokeWidth={2} 
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />

      {/* Decorative Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <Animatable.View animation="fadeInDown" delay={50} style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color="#2C3E50" strokeWidth={2} />
            </View>
          </View>
          <Text style={styles.userName}>{userName || 'N/A'}</Text>
          <View style={styles.roleBadge}>
            <BadgeCheck size={16} color="#2C3E50" strokeWidth={2.5} />
            <Text style={styles.roleText}>
              {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'N/A'}
            </Text>
          </View>
        </Animatable.View>

        {/* Account Section */}
        <Animatable.View animation="fadeInUp" delay={150} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
          <View style={styles.card}>
            <SettingItem
              icon={KeyRound}
              title={t('settings.changePassword')}
              onPress={() => alertCtx.showAlert({
                title: t('messages.featureComingSoon'),
                message: t('messages.thisFeatureWillBe'),
                type: 'info'
              })}
            />
          </View>
        </Animatable.View>

        {/* Privacy Section */}
        <Animatable.View animation="fadeInUp" delay={250} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.privacy')}</Text>
          <View style={styles.card}>
            <SettingItem
              icon={Shield}
              title={t('settings.privacyPolicy')}
              onPress={() => alertCtx.showAlert({
                title: t('settings.privacyPolicy'),
                message: t('messages.privacyPolicyInfo'),
                type: 'info'
              })}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={Download}
              title={t('settings.dataExport')}
              onPress={() => alertCtx.showAlert({
                title: t('settings.dataExport'),
                message: t('messages.dataExportInfo'),
                type: 'info'
              })}
            />
          </View>
        </Animatable.View>

        {/* Notifications Section */}
        <Animatable.View animation="fadeInUp" delay={350} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
          <View style={styles.card}>
            <SettingItem
              icon={BellRing}
              title={t('settings.notificationPreferences')}
              onPress={() => alertCtx.showAlert({
                title: t('settings.notificationPreferences'),
                message: t('messages.notificationPreferencesInfo'),
                type: 'info'
              })}
            />
          </View>
        </Animatable.View>

        {/* Language Section */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.settingItem} 
              onPress={() => setLanguageModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.settingIconContainer}>
                <Globe 
                  size={20} 
                  color="#2C3E50" 
                  strokeWidth={2.5} 
                />
              </View>
              <View style={styles.languageInfo}>
                <Text style={styles.settingTitle}>{t('settings.selectLanguage')}</Text>
                <Text style={styles.currentLanguage}>{getCurrentLanguageInfo().nativeName}</Text>
              </View>
              <ChevronRight 
                size={20} 
                color="#95A5A6" 
                strokeWidth={2} 
              />
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* General Section */}
        <Animatable.View animation="fadeInUp" delay={500} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.general')}</Text>
          <View style={styles.card}>
            <SettingItem
              icon={User} // or use a profile/business icon
              title={t('Manage Profile') || 'Business Profile Setup'}
              // Open the modal instead of navigation
              onPress={() => setBusinessProfileModalVisible(true)}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={Info}
              title={t('settings.appInformation')}
              onPress={() => alertCtx.showAlert({
                title: t('settings.appInformation'),
                message: `${t('settings.version', {version: '1.0.0'})}\n${t('settings.developedBy')}`,
                type: 'info'
              })}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={Mail}
              title={t('settings.contactSupport')}
              onPress={() => alertCtx.showAlert({
                title: t('settings.contactSupport'),
                message: t('settings.supportEmail'),
                type: 'info'
              })}
            />
          </View>
        </Animatable.View>

        {/* Logout Button */}
        <Animatable.View animation="fadeInUp" delay={600} style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LogOut size={20} color="#fff" strokeWidth={2.5} />
            <Text style={styles.logoutButtonText}>{t('common.logout')}</Text>
          </TouchableOpacity>
        </Animatable.View>

        {/* App Version Footer */}
        <Animatable.View animation="fadeIn" delay={700} style={styles.footer}>
          <Text style={styles.footerText}>Trinity Billing v1.0.0</Text>
        </Animatable.View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={languageModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setLanguageModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('settings.languageSelection')}</Text>
            <View style={styles.modalCloseButton} />
          </View>
          
          <FlatList
            data={getAvailableLanguages()}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.languageOption}
                onPress={() => handleLanguageChange(item.code)}
                activeOpacity={0.7}
              >
                <View style={styles.languageOptionContent}>
                  <View>
                    <Text style={styles.languageName}>{item.nativeName}</Text>
                    <Text style={styles.languageNameEn}>{item.name}</Text>
                  </View>
                  {currentLanguage === item.code && (
                    <Check size={20} color="#1abc9c" strokeWidth={2.5} />
                  )}
                </View>
              </TouchableOpacity>
            )}
            style={styles.languageList}
          />
        </View>
      </Modal>

      {/* Business Profile Setup Modal */}
      <BusinessProfileSetupModal
        visible={businessProfileModalVisible}
        onClose={() => setBusinessProfileModalVisible(false)}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#E7FCEA',
    position: 'relative',
    marginBottom: Platform.OS === 'ios' ? 90 : (StatusBar.currentHeight ? StatusBar.currentHeight + 70 : 110),
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(44, 62, 80, 0.05)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -120,
    left: -90,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(44, 62, 80, 0.05)',
  },
  container: {
    flex: 1,
    paddingTop: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#2C3E50',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  destructiveIconContainer: {
    backgroundColor: '#FCE4E4',
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  destructiveText: {
    color: '#E74C3C',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 74,
  },
  logoutContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  logoutButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#E74C3C',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  logoutButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#95A5A6',
    fontWeight: '600',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#BDC3C7',
    fontWeight: '500',
  },
  // Language selection styles
  languageInfo: {
    flex: 1,
  },
  currentLanguage: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  modalCloseButton: {
    minWidth: 60,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#1abc9c',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  languageList: {
    flex: 1,
  },
  languageOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  languageOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  languageNameEn: {
    fontSize: 14,
    color: '#7F8C8D',
  },
});