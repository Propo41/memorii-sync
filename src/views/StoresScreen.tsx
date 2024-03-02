import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { Button, Text, makeStyles, useTheme } from '@rneui/themed';
import { toSize } from '../helpers/scaling';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TitleBar from '../components/TitleBar';
import { iconSize, margins } from '../config';
import { FF_REGULAR } from '../theme/typography';
import { useTranslation } from 'react-i18next';
import { NavProps, NavRoutes } from '../config/routes';
import { useFocusEffect } from '@react-navigation/native';
import { FirebaseApp } from '../models/FirebaseApp';
import { _Market } from '../models/dto';
import { fetchOfferings } from '../helpers/utility';

type StoreItemProps = {
  mt?: number;
  mb?: number;
  onPress: () => void;
  color: string;
  title: string;
  subtitle: string;
  discountRate: number;
  oldPrice: number;
};

const StoreItem = ({ mt, mb, onPress, color, title, subtitle, discountRate, oldPrice }: StoreItemProps) => {
  const styles = useStyles();
  const { t } = useTranslation();
  const newPrice = oldPrice - (oldPrice * discountRate) / 100;

  return (
    <View style={{ ...styles.itemContainer, marginTop: mt || 0, marginBottom: mb || 0 }}>
      <View style={styles.itemContent}>
        <View style={{ ...styles.itemContentLeft, backgroundColor: color }}>
          <Text head3 style={styles.text}>
            {title}
          </Text>
          <View style={styles.flexGrow} />
          <Text body2 style={styles.text}>
            {subtitle}
          </Text>
        </View>
        <View style={styles.flexGrow} />

        <View style={styles.itemContentRight}>
          {discountRate !== 0 && <Text style={{ ...styles.itemContentRightText1, ...styles.mt, color: color }}>৳{oldPrice}</Text>}
          <Text
            head2
            style={{
              color: color,
              marginTop: discountRate ? styles.mt_0.marginTop : styles.mt.marginTop,
            }}
          >
            ৳{newPrice}
          </Text>
          <View style={styles.flexGrow} />
          <Button
            title={t('screens.store.view')}
            color={color}
            containerStyle={styles.itemButton}
            titleStyle={{
              fontFamily: FF_REGULAR,
            }}
            onPress={onPress}
          />
        </View>
      </View>
    </View>
  );
};

export default function StoresScreen({ navigation }: NavProps) {
  const { theme } = useTheme();
  const styles = useStyles();
  const [market, setMarket] = useState<_Market[]>([]);
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    init();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const init = () => {
    FirebaseApp.getInstance()
      .fetchMarketItems()
      .then(async (items) => {
        const offerings = await fetchOfferings();
        const marketItems = items.map((item) => {
          const inAppPackage = offerings.find((offeringPkg) => offeringPkg.offeringIdentifier === item.offeringIdentifier);
          if (inAppPackage) {
            item._package = inAppPackage;
          }

          return item;
        });

        setMarket(marketItems);
      });
  };

  useFocusEffect(
    useCallback(() => {
      init();
    }, [])
  );

  return (
    <View>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <TitleBar
          title={t('screens.store.title')}
          subtitle={t('screens.store.subtitle')}
          icon={<Icon name="shopping-cart" color={theme.colors.purple} size={iconSize.lg} style={styles.headerIcon} />}
        />
        <View style={{ marginTop: theme.spacing.lg }}>
          {market.map((item, index) => {
            return (
              <StoreItem
                key={index}
                title={item.title}
                subtitle={item.subtitle}
                color={item.color}
                oldPrice={item.price} // todo: change it to price string
                discountRate={item.discountRate}
                mt={index > 0 ? 8 : 0}
                mb={index === market.length - 1 ? 70 : 0}
                onPress={() => {
                  // @ts-expect-error cant fix this ts error
                  navigation.push(NavRoutes.Store, {
                    store: item,
                  });
                }}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  headerIcon: {
    marginVertical: toSize(20),
  },
  image: {
    marginTop: 30,
  },
  itemContainer: {
    borderRadius: 15,
    marginHorizontal: margins.window_hor,
    overflow: 'hidden',
    backgroundColor: theme.colors.lightAsh,
  },
  itemContent: {
    display: 'flex',
    flexDirection: 'row',
    height: toSize(150),
  },
  itemContentLeft: {
    width: '60%',
    paddingLeft: toSize(15),
    paddingTop: toSize(10),
    paddingBottom: toSize(10),
  },
  itemContentRight: {
    display: 'flex',
    width: '40%',
    alignItems: 'center',
  },
  itemContentRightText1: {
    textDecorationLine: 'line-through',
  },
  mt: {
    marginTop: toSize(25),
  },
  mt_0: {
    marginTop: toSize(0),
  },
  itemButton: {
    borderRadius: 10,
    marginBottom: toSize(10),
    width: toSize(110),
  },
  text: {
    color: theme.colors.white,
  },
  flexGrow: {
    flexGrow: 1,
  },
}));
