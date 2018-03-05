DELIMITER $$

CREATE DEFINER=`root`@`localhost` FUNCTION `get_distance_metres` (`latitudeDepart` DOUBLE, `longitudeDepart` DOUBLE, `latitudeArrivee` DOUBLE, `longitudeArrivee` DOUBLE) RETURNS DOUBLE BEGIN
    DECLARE radLongitudeDepart DOUBLE;
    DECLARE radLatitudeDepart DOUBLE;
    DECLARE radLongitudeArrivee DOUBLE;
    DECLARE radLatitudeArrivee DOUBLE;
    DECLARE dlo DOUBLE;
    DECLARE dla DOUBLE;
    DECLARE a DOUBLE;
    SET radLongitudeDepart = RADIANS(longitudeDepart);
    SET radLatitudeDepart = RADIANS(latitudeDepart);
    SET radLongitudeArrivee = RADIANS(longitudeArrivee);
    SET radLatitudeArrivee = RADIANS(latitudeArrivee);
    SET dlo = (radLongitudeArrivee - radLongitudeDepart) / 2;
    SET dla = (radLatitudeArrivee - radLatitudeDepart) / 2;
    SET a = SIN(dla) * SIN(dla) + COS(radLatitudeDepart) * COS(radLatitudeArrivee) * SIN(dlo) * SIN(dlo);
    RETURN (6367445 * 2 * ATAN2(SQRT(a), SQRT(1 - a)));
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `ISO8601TOUNIXTIMESTAMP` (`iso` VARCHAR(25)) RETURNS INT(15) BEGIN
DECLARE CONVTIME INTEGER(11);
SET CONVTIME = (SUBSTRING(iso,21,2) * 60) + SUBSTRING(iso,24,2);
IF SUBSTRING(iso,20,1) = '+' THEN
SET CONVTIME = 0 - CONVTIME;
END IF;
RETURN UNIX_TIMESTAMP(DATE_ADD(STR_TO_DATE(CONCAT(SUBSTRING(iso,1,10),' ',SUBSTRING(iso,12,8)),'%Y-%m-%d %H:%i:%s'), INTERVAL CONVTIME MINUTE));
END$$

DELIMITER ;


CREATE TABLE `message` (
  `id` bigint(20) NOT NULL,
  `id_src` bigint(20) NOT NULL,
  `id_dst` bigint(20) NOT NULL,
  `text` varchar(1024) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `new` tinyint(4) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `notification` (
  `id` bigint(20) NOT NULL,
  `new` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1 Si la notification n''as pas été lue, sinon 0',
  `src` bigint(20) NOT NULL,
  `dst` bigint(20) NOT NULL,
  `type` tinyint(4) NOT NULL COMMENT '0 = Nouveau like, 1 = Nouvelle visite, 2 = Nouveau Message, 3 = Nouveau match, 4 = Match perdu',
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `report` (
  `id` bigint(20) NOT NULL,
  `id_reporteur` bigint(20) NOT NULL,
  `id_reporte` bigint(20) NOT NULL,
  `raison` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `tags` (
  `id` bigint(20) NOT NULL,
  `name` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `login` varchar(24) NOT NULL,
  `password` varchar(150) NOT NULL,
  `prenom` varchar(36) NOT NULL,
  `nom` varchar(36) NOT NULL,
  `birth_date` datetime DEFAULT NULL,
  `img1` varchar(1024) DEFAULT NULL,
  `img2` varchar(1024) DEFAULT NULL,
  `img3` varchar(1024) DEFAULT NULL,
  `img4` varchar(1024) DEFAULT NULL,
  `img5` varchar(1024) DEFAULT NULL,
  `or_h` tinyint(4) NOT NULL DEFAULT '1',
  `or_f` tinyint(4) NOT NULL DEFAULT '1',
  `or_a` tinyint(4) NOT NULL DEFAULT '1',
  `longitude` double DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `ville` varchar(40) DEFAULT NULL,
  `sexe` tinyint(4) NOT NULL DEFAULT '0',
  `bio` varchar(1024) DEFAULT '"Pas de description"',
  `email` varchar(320) NOT NULL,
  `popularity` int(11) NOT NULL DEFAULT '500',
  `status` tinyint(4) NOT NULL DEFAULT '0' COMMENT '0 si deconnexion manuelle, 1 sinon',
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `forgot_password` varchar(65) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `user_tag` (
  `id` bigint(20) NOT NULL,
  `id_tag` bigint(20) NOT NULL,
  `id_user` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `visite` (
  `id` bigint(20) NOT NULL,
  `id_visiteur` bigint(20) NOT NULL,
  `id_visite` bigint(20) NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `vote` (
  `id` bigint(20) NOT NULL,
  `id_src` bigint(20) NOT NULL,
  `id_dst` bigint(20) NOT NULL,
  `value` tinyint(4) NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `message`
  ADD KEY `id` (`id`);

ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `user_tag`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `visite`
  ADD KEY `id` (`id`);

ALTER TABLE `vote`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `message`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `notification`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `tags`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `user_tag`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `visite`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;


ALTER TABLE `vote`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;
